import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { createClient } from "pexels";
import axios from "axios";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import os from "os";
import ffmpeg from "fluent-ffmpeg";

const elevenLabsClient = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

interface AudioResponse {
    audio_base64: string;
    alignment: {
        character_end_times_seconds: number[];
    };
}

const pexelsClient = createClient(process.env.PEXELS_API_KEY || 'default_api_key');

export async function POST(req: Request) {
    try {
        const { voiceId, parts, videoOrientation } = await req.json();
        const videoSegments = [];

        const scaleFilter = videoOrientation === "landscape" ? "scale=1280:720" : "scale=720:1280";

        for (const part of parts) {
            console.log("Processing part: ", part.text);
            console.log("Stock video query: ", part.query);

            // Generate audio using ElevenLabs
            const audioResponse: AudioResponse = await elevenLabsClient.textToSpeech.convertWithTimestamps(voiceId, {
                output_format: "mp3_44100_128",
                text: part.text,
                previous_text: part.previous || "",
                next_text: part.next || "",
                model_id: "eleven_multilingual_v2",
            }) as AudioResponse;

            console.log("Received audio.");

            const audioBase64 = audioResponse.audio_base64; // Assuming audio is returned as a Base64 string
            if (!audioBase64) {
                throw new Error(`Failed to generate audio for part: ${part.text}`);
            }

            // Calculate audio duration from the alignment object
            const alignment = audioResponse.alignment;
            if (!alignment || !alignment.character_end_times_seconds || alignment.character_end_times_seconds.length === 0) {
                throw new Error(`Failed to retrieve alignment data for part: ${part.text}`);
            }
            const audioDuration = alignment.character_end_times_seconds[alignment.character_end_times_seconds.length - 1];

            console.log("Audio duration: ", audioDuration);

            // Search for stock videos using Pexels
            const videoResponse = await pexelsClient.videos.search({ query: part.query, per_page: 5, orientation: videoOrientation });

            if (!('videos' in videoResponse) || videoResponse.videos.length === 0) {
                throw new Error(`No videos found for query: ${part.query}`);
            }

            console.log("Found videos: ", videoResponse.videos.length);

            let totalVideoDuration = 0;
            const selectedVideos = [];

            for (const video of videoResponse.videos) {
                if (totalVideoDuration >= audioDuration) break;
                selectedVideos.push(video.video_files[0].link);
                totalVideoDuration += video.duration;
            }

            if (totalVideoDuration < audioDuration) {
                throw new Error(`Insufficient video duration for part: ${part.text}`);
            }

            // Process video trimming and concatenation for this part
            // Create a temporary directory for this part
            const tempDir = path.join(os.tmpdir(), `video-part-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`);
            await fsPromises.mkdir(tempDir, { recursive: true });

            const numVideos = selectedVideos.length;
            const allocatedDuration = audioDuration / numVideos;
            const trimmedVideoPaths: string[] = [];

            // For each selected video: download and trim it to the allocated duration
            for (let i = 0; i < numVideos; i++) {
                const videoUrl = selectedVideos[i];
                const videoFile = path.join(tempDir, `video_${i}.mp4`);
                const trimmedFile = path.join(tempDir, `video_${i}_trim.mp4`);
                // Download the video file
                const response = await axios.get(videoUrl, { responseType: 'stream' });
                const writer = fs.createWriteStream(videoFile);
                response.data.pipe(writer);
                await new Promise<void>((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                // Trim and scale the video using ffmpeg
                await new Promise<void>((resolve, reject) => {
                    ffmpeg(videoFile)
                        .setStartTime(0)
                        .setDuration(allocatedDuration)
                        .videoFilters(scaleFilter)
                        .outputOptions([
                            '-c:v', 'libx264',  // Use H.264 codec
                            '-preset', 'fast',  // Use a fast preset for encoding
                            '-crf', '23',       // Set the quality level
                            '-c:a', 'aac',      // Use AAC codec for audio
                            '-b:a', '192k',     // Set audio bitrate
                            '-vf', scaleFilter, // Apply scaling filter
                            '-r', '30',         // Set frame rate to 30 fps
                        ])
                        .output(trimmedFile)
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                });
                trimmedVideoPaths.push(trimmedFile);
            }
            console.log("Trimmed all videos");

            // Concatenate the trimmed videos using ffmpeg's concat demuxer
            const fileListPath = path.join(tempDir, 'filelist.txt');
            const fileListContent = trimmedVideoPaths.map(v => `file '${v}'`).join('\n');
            await fsPromises.writeFile(fileListPath, fileListContent);
            const concatenatedPath = path.join(tempDir, 'concatenated.mp4');
            await new Promise<void>((resolve, reject) => {
                ffmpeg()
                    .input(fileListPath)
                    .inputOptions(['-f', 'concat', '-safe', '0'])
                    .outputOptions(['-c', 'copy'])
                    .output(concatenatedPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            console.log("Concatenated all videos");

            // Remove audio from the concatenated video
            const noAudioPath = path.join(tempDir, 'no_audio.mp4');
            await new Promise<void>((resolve, reject) => {
                ffmpeg(concatenatedPath)
                    .outputOptions(['-an']) // Remove audio
                    .output(noAudioPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            console.log("Removed audio from concatenated video");

            // Decode the audio Base64 string and write it to an mp3 file
            const audioFilePath = path.join(tempDir, 'audio.mp3');
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            await fsPromises.writeFile(audioFilePath, audioBuffer);

            console.log("Decoded audio");

            // Merge the no-audio video with the audio track, applying audio padding
            const partFinalPath = path.join(tempDir, 'part_final.mp4');
            await new Promise<void>((resolve, reject) => {
                ffmpeg(noAudioPath)
                    .input(audioFilePath)
                    .outputOptions([     // Pad the audio stream so it matches the video duration
                        '-c:v', 'copy',          // Copy the video stream without re-encoding
                        '-c:a', 'aac',           // Re-encode the audio to AAC (or choose another codec as needed)
                        '-shortest',             // Ensure the output is trimmed to the shortest stream
                        '-avoid_negative_ts', 'make_zero',  // Force non-negative timestamps
                        '-fflags', '+genpts'     // Regenerate presentation timestamps
                    ])
                    .output(partFinalPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            console.log("Merged no-audio video with audio track");

            // Push the final processed segment for this part
            videoSegments.push(partFinalPath);
            console.log("Processed part location: ", partFinalPath);
        }
        
        // Concatenate all part video segments together
        const publicDir = path.join(process.cwd(), 'public', 'videos');
        await fsPromises.mkdir(publicDir, { recursive: true });

        const finalFileList = videoSegments.map(v => `file '${v}'`).join('\n');
        const finalListPath = path.join(publicDir, 'final_filelist.txt');
        await fsPromises.writeFile(finalListPath, finalFileList);
        const finalVideoPath = path.join(publicDir, 'final_video.mp4');
        const finalScaleFilter = videoOrientation === "landscape" ? "scale=1280:720" : "scale=720:1280";
        await new Promise<void>((resolve, reject) => {
            ffmpeg()
                .input(finalListPath)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .videoFilters(finalScaleFilter)
                .outputOptions(['-fflags', '+genpts', '-c:v', 'libx264', '-crf', '23', '-preset', 'fast'])
                .output(finalVideoPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // Clean up intermediate files
        for (const segment of videoSegments) {
            await fsPromises.unlink(segment);
        }
        await fsPromises.unlink(finalListPath);

        const finalVideoUrl = `/videos/final_video.mp4`;

        return NextResponse.json({ videoUrl: finalVideoUrl });
    } catch (error) {
        console.error("Error in generate-audio-video:", error);
        return NextResponse.error();
    }
}