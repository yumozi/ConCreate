'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const VideoConcatenationPage = () => {
  const [videoUrl1, setVideoUrl1] = useState<string>('');
  const [videoUrl2, setVideoUrl2] = useState<string>('');
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConcatenateVideos = async () => {
    if (!videoUrl1 || !videoUrl2) {
      alert('Please enter both video URLs.');
      return;
    }

    try {
      const response = await fetch('/api/concatenate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl1, videoUrl2 }),
      });

      if (!response.ok) {
        throw new Error('Failed to concatenate videos');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadLink(url);
    } catch (error) {
      console.error('Video processing error:', error);
      alert('Failed to process video.');
    }
  };

  return (
    <div>
      <h1>Concatenate Two Videos</h1>
      <input
        type="text"
        value={videoUrl1}
        onChange={(e) => setVideoUrl1(e.target.value)}
        placeholder="Enter first video URL"
      />
      <input
        type="text"
        value={videoUrl2}
        onChange={(e) => setVideoUrl2(e.target.value)}
        placeholder="Enter second video URL"
      />
      {isClient && <button onClick={handleConcatenateVideos}>Concatenate Videos</button>}
      {downloadLink && (
        <a href={downloadLink} download="concatenated_video.mp4">
          Download Concatenated Video
        </a>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(VideoConcatenationPage), { ssr: false });
