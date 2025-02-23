'use client'
import React, { useState } from "react";

const voiceOptions = [
  { id: "nPczCjzI2devNBz1zQrb", name: "Voice 1" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Voice 2" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Voice 3" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Voice 4" }
];

export default function Home() {
  // stage can be: "entry", "loadingScript", "editScript", "loadingSplit", "selectVoice", "loadingFinal", "result"
  const [stage, setStage] = useState("entry");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoLength, setVideoLength] = useState("15s"); // options: "15s", "1m", "5min"
  const [generatedScript, setGeneratedScript] = useState("");
  const [editedScript, setEditedScript] = useState("");
  const [splitParts, setSplitParts] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(voiceOptions[0].id);
  const [finalVideoUrl, setFinalVideoUrl] = useState("");

  // Utility: simple spinner component
  const Spinner = () => (
    <div className="flex justify-center items-center">
      <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
    </div>
  );

  // Handler for stage 1 (Generate script)
  const handleGenerateScript = async () => {
    if (!videoDescription) return;
    setStage("loadingScript");
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: videoDescription, videoLength })
      });
      const data = await res.json();
      setGeneratedScript(data.script);
      setEditedScript(data.script);
      setStage("editScript");
    } catch (error) {
      console.error("Error generating script:", error);
      setStage("entry");
    }
  };

  // Handler for stage 2 (Confirm edited script)
  const handleConfirmScript = async () => {
    setStage("loadingSplit");
    try {
      const res = await fetch("/api/split-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: editedScript })
      });
      const data = await res.json();
      setSplitParts(data.parts);
      setStage("selectVoice");
    } catch (error) {
      console.error("Error splitting script:", error);
      setStage("editScript");
    }
  };

  // Handler for stage 3 (Generate audio-video final result)
  const handleGenerateVideo = async () => {
    setStage("loadingFinal");
    try {
      const res = await fetch("/api/generate-audio-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId: selectedVoice, parts: splitParts })
      });
      const data = await res.json();
      setFinalVideoUrl(data.videoUrl);
      setStage("result");
    } catch (error) {
      console.error("Error generating video:", error);
      setStage("selectVoice");
    }
  };

  // Render progress indicator icons (three stages) with a highlighted step
  const ProgressIndicator = ({ currentStage }: { currentStage: number }) => {
    // currentStage: 1, 2 or 3 (for the 3 steps)
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                num === currentStage
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {num}
            </div>
            {num !== 3 && (
              <div className="w-16 h-px bg-gray-300 mx-2"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {stage === "entry" || stage === "loadingScript" ? (
        <div
          className={`flex flex-col sm:flex-row items-center justify-center transition-opacity duration-500 ${
            stage === "loadingScript" ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Left side: title, subtitle, capsule tags */}
          <div className="sm:w-1/2 mb-8 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Turn Your Ideas into Videos with AI!
            </h1>
            <p className="text-lg mb-4">
              Just type your idea, and AI will find the right clips, generate narration, and edit everything together—so you don’t have to!
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "AI Scription",
                "AI VoiceOver",
                "One-Click Video",
                "AI footage selection",
                "AI auto-editing"
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Right side: white box with textarea and video length options */}
          <div className="sm:w-1/2 bg-white p-6 rounded shadow">
            <textarea
              className="w-full h-40 p-2 border rounded mb-4"
              placeholder="Describe your video idea..."
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
            ></textarea>
            <div className="flex items-center mb-4">
              {["15s", "1m", "5min"].map((option) => (
                <button
                  key={option}
                  className={`mr-4 px-3 py-1 border rounded ${
                    videoLength === option ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                  onClick={() => setVideoLength(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={handleGenerateScript}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {stage === "loadingScript" && (
        <div className="mt-8">
          <Spinner />
          <p className="text-center mt-4">Generating script...</p>
        </div>
      )}

      {stage === "editScript" || stage === "loadingSplit" ? (
        <div className={`mt-8 transition-opacity duration-500 ${stage === "loadingSplit" ? "opacity-0" : "opacity-100"}`}>
          <ProgressIndicator currentStage={1} />
          <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
            <textarea
              className="w-full h-48 p-2 border rounded mb-4"
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={handleConfirmScript}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {stage === "loadingSplit" && (
        <div className="mt-8">
          <Spinner />
          <p className="text-center mt-4">Splitting script into segments...</p>
        </div>
      )}

      {stage === "selectVoice" || stage === "loadingFinal" ? (
        <div className={`mt-8 transition-opacity duration-500 ${stage === "loadingFinal" ? "opacity-0" : "opacity-100"}`}>
          <ProgressIndicator currentStage={2} />
          <div className="flex flex-col sm:flex-row items-center justify-center max-w-3xl mx-auto bg-white p-6 rounded shadow">
            {/* Left section: text */}
            <div className="sm:w-1/2 mb-4 sm:mb-0">
              <h2 className="text-xl font-bold mb-2">
                Pick the perfect AI voice to bring your video to life!
              </h2>
              <p>Different voices create different moods. Choose the one that best fits your video style.</p>
            </div>
            {/* Right section: voice selection box */}
            <div className="sm:w-1/2">
              <div className="border rounded divide-y">
                {voiceOptions.map((voice) => (
                  <div
                    key={voice.name}
                    className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <span>{voice.name}</span>
                    {selectedVoice === voice.id && (
                      <span className="text-blue-500 font-bold">✔</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  onClick={handleGenerateVideo}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {stage === "loadingFinal" && (
        <div className="mt-8">
          <Spinner />
          <p className="text-center mt-4">Generating audio-visual content...</p>
        </div>
      )}

      {stage === "result" && (
        <div className="mt-8 text-center">
          <ProgressIndicator currentStage={3} />
          <h2 className="text-2xl font-bold mb-4">Your video is ready!</h2>
          <a
            href={finalVideoUrl}
            download
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}