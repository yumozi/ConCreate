import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { createClient } from "pexels";

const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const pexelsClient = createClient(process.env.NEXT_PUBLIC_PEXELS_API_KEY || 'default_api_key');

export async function POST(req: Request) {
  try {
    const { voiceId, parts } = await req.json();
    const videoSegments = [];

    for (const part of parts) {
      // Generate audio using ElevenLabs
      const audioResponse = await elevenLabsClient.textToSpeech.convert(voiceId, {
        output_format: "mp3_44100_128",
        text: part.text,
        previous_text: part.previous || "",
        next_text: part.next || "",
        model_id: "eleven_multilingual_v2",
      });

      const audioBase64 = audioResponse.audio_base64; // Assuming audio is returned as a Base64 string
      if (!audioBase64) {
        throw new Error(`Failed to generate audio for part: ${part.text}`);
      }

      // Calculate audio duration from the Base64 string (this is a placeholder, actual calculation may vary)
      const audioDuration = calculateAudioDuration(audioBase64);

      // Search for stock videos using Pexels
      const videoResponse = await pexelsClient.videos.search({ query: part.query, per_page: 5 });

      if (!('videos' in videoResponse) || videoResponse.videos.length === 0) {
        throw new Error(`No videos found for query: ${part.query}`);
      }

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

      // Here, you would trim and concatenate videos with audio using a tool like ffmpeg
      // For now, we simulate this process
      videoSegments.push({ audio: audioBase64, videos: selectedVideos });
    }

    // Simulate concatenation of video segments
    const finalVideoUrl = "https://dummyvideo.com/final-video.mp4";

    return NextResponse.json({ videoUrl: finalVideoUrl });
  } catch (error) {
    console.error("Error in generate-audio-video:", error);
    return NextResponse.error();
  }
}

function calculateAudioDuration(audioBase64: string): number {
  // Placeholder function to calculate audio duration from Base64 string
  // Actual implementation would depend on the audio format and encoding
  return 10; // Return a dummy duration for now
}