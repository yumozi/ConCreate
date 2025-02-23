'use client'
import { useState } from 'react';
import { createClient } from 'pexels';
import { useEffect } from 'react';

const client = createClient(process.env.NEXT_PUBLIC_PEXELS_API_KEY || 'default_api_key');

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      const response = await client.videos.search({ query, per_page: 1 });
      if ('videos' in response && response.videos.length > 0) {
        console.log(response.videos[0].video_files[0].link);
        setVideoUrl(response.videos[0].video_files[0].link);
      } else {
        alert('No videos found.');
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      alert('Failed to search videos.');
    }
  };

  return (
    <div>
      <h1>Search for a Video</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter search query"
        className="text-black"
      />
      <button onClick={handleSearch}>Search</button>
      {videoUrl && (
        <div>
          <h2>Video Result</h2>
          <video width="600" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 