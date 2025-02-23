'use client'
import React, { useState } from "react";
import Head from "next/head";
import { FileText, AudioLines, Bot, Loader2, Video, CheckCircle, Clock, Play } from "lucide-react";

const voiceOptions = [
  {
    id: "nPczCjzI2devNBz1zQrb",
    name: "Bill",
    tags: ["Male", "American", "Narration", "Trustworthy"],
    description: "A calm, trustworthy voice suitable for narration and tutorials.",
  },
  {
    id: "e0cjoBslZOaE21PPCCuh",
    name: "Rhys",
    tags: ["Male", "British", "Pleasant", "Young"],
    description: "A pleasant British accent that brings a younger, friendly feel."
  },
  {
    id: "bMxLr8fP6hzNRRi9nJxU",
    name: "Ivanna",
    tags: ["Female", "American", "Conversational", "Friendly"],
    description: "A charming and playful voice with a casual, friendly tone."
  },
  {
    id: "56AoDkrOh6qfVPDXZ7Pt",
    name: "Cassidy",
    tags: ["Female", "American", "Conversational", "Confident"],
    description: "A confident, energetic voice for bold presentations and announcements."
  }
];

export default function Home() {
  // stage can be: "entry", "loadingScript", "editScript", "loadingSplit", "selectVoice", "loadingFinal", "result"
  const [stage, setStage] = useState("entry");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoLength, setVideoLength] = useState("15s"); // options: "15s", "1m", "5min"
  const [videoOrientation, setVideoOrientation] = useState("landscape"); // options: "landscape", "portrait"
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
        body: JSON.stringify({
          voiceId: selectedVoice,
          parts: splitParts,
          videoOrientation: videoOrientation
        })
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
    const icons = [
      <FileText size={22} strokeWidth={1.2} key="file-text" />,
      <AudioLines size={22} strokeWidth={1.2} key="audio-lines" />,
      <Video size={22} strokeWidth={1.2} key="video" />
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {icons.map((icon, index) => (
          <React.Fragment key={index}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border ${index + 1 === currentStage
                ? "bg-[#4771F4] text-white border-[#4771F4]"
                : "bg-transparent text-[#4771F4] border-[#4771F4]"
                }`}
            >
              {icon}
            </div>
            {index !== 2 && (
              <div className="w-10 h-[1.5px] bg-[#4771F4] mx-2"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white overflow-hidden">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="fixed inset-0 pointer-events-none overflow-hidden w-full h-full" style={{ zIndex: 0 }}>
        {/* 绿色背景圈 */}
        <div
          className="absolute left-[20%] top-[50%] w-[393px] h-[393px] rounded-full"
          style={{
            backgroundColor: "rgba(204, 249, 197, 0.60)",
            filter: "blur(100px) drop-shadow(0px 4px 169.4px #CCF9C5)",
            zIndex: -1
          }}
        ></div>

        {/* 蓝色背景圈 */}
        <div
          className="absolute left-[35%] top-[25%] w-[238px] h-[239px] rounded-full"
          style={{
            backgroundColor: "rgba(71, 113, 244, 0.70)",
            filter: "blur(100px) drop-shadow(0px 4px 169.4px #4771F4)",
            zIndex: -1
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {stage === "entry" || stage === "loadingScript" ? (
          <div
            className={`flex flex-col sm:flex-row items-start justify-between transition-opacity max-h-screen text-black duration-500 ${stage === "loadingScript" ? "opacity-0" : "opacity-100"
              }`}
          >
            {/* Left Box */}
            <div className="w-full sm:w-1/2 mb-8 sm:mb-0 pr-4 text-left flex flex-col justify-center pl-32 font-sans h-screen pb-16">
              <h1 className="text-3xl sm:text-6xl font-semibold mb-8">
                Turn Your Ideas into Videos with AI!
              </h1>
              <p className="text-xl mb-8 pr-8">
                Our AI Agent will craft a natural narration, curate the perfect clips, and seamlessly edit them together to bring your video to life in minutes.
              </p>
              <div className="flex flex-wrap gap-2 pr-16">
                {["AI Scriptwriting", "AI VoiceOver", "Instant Video Production", "Automated Footage Curation", "Smart Video Editing"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-[239.717px] border-[0.799px] border-[#4771F4] text-[#4771F4] text-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Box */}
            <div className="w-full sm:w-1/2 p-32 flex items-center justify-center min-h-screen pb-32" style={{ margin: 32 }}>
              {/* White Box */}
              <div className="aspect-square bg-white shadow-[0px_0px_36.473px_rgba(0,0,0,0.25)] backdrop-blur-[5.179px] rounded-lg flex-shrink-0 p-6 flex flex-col justify-between" style={{ height: '70vh', width: '70vh', transform: 'translateX(-20%)' }}>
                <textarea
                  className="w-full h-2/3 p-2 border-b-[0.87px] border-[#D9D9D9] bg-white outline-none focus:border-[#4771F4] transition mb-6"
                  style={{ resize: 'none' }}
                  placeholder="Describe your video idea..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                ></textarea>

                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <span className="text-md mr-4">Video Length</span>
                    {["15s", "1m", "5min"].map((option) => (
                      <button
                        key={option}
                        className={`mr-2 px-4 py-1 rounded-[174.09px] border-[0.87px] transition ${videoLength === option
                            ? "bg-[#4771F4] text-white border-[#4771F4]"
                            : "bg-transparent text-black border-[#4771F4]"
                          }`}
                        onClick={() => setVideoLength(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center mb-4">
                    <span className="text-md mr-4">Video Orientation</span>
                    {["landscape", "portrait"].map((orientation) => (
                      <button
                        key={orientation}
                        className={`mr-2 px-4 py-1 rounded-[174.09px] border-[0.87px] transition ${videoOrientation === orientation
                            ? "bg-[#4771F4] text-white border-[#4771F4]"
                            : "bg-transparent text-black border-[#4771F4]"
                          }`}
                        onClick={() => setVideoOrientation(orientation)}
                      >
                        {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-auto">
                  <button
                    className="w-[158.425px] h-[49.617px] rounded-[174.094px] bg-[#4771F4] text-white text-lg font-medium flex-shrink-0 hover:bg-[#3659C9] transition"
                    onClick={handleGenerateScript}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {stage === "loadingScript" && (
          <div className="mt-8 flex flex-col items-center">
            {/* Bot with Loading Animation */}
            <div className="relative">
              {/* Bot Icon */}
              <Bot className="w-20 h-20 text-gray-900" />

              {/* Spinner on Top Right */}
              <Loader2 className="absolute -top-2 right-0 w-6 h-6 text-blue-500 animate-spin" />
            </div>

            {/* Loading Text */}
            <p className="text-center mt-4 text-lg font-semibold text-gray-700">
              Generating script...
            </p>
          </div>
        )}

        {stage === "editScript" || stage === "loadingSplit" ? (
          <div className={`mt-8 transition-opacity duration-500 ${stage === "loadingSplit" ? "opacity-0" : "opacity-100"}`}>
            <ProgressIndicator currentStage={1} />
            <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
              <p className="text-lg font-medium text-gray-700 mb-4">
                AI has generated a script for you—feel free to edit!
              </p>
              <textarea
                className="w-full h-48 p-2 border rounded mb-4"
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
              ></textarea>
              <div className="flex justify-end">
                <button
                  className="w-[158.425px] h-[49.617px] rounded-[174.094px] bg-[#4771F4] text-white text-lg font-medium flex-shrink-0 hover:bg-[#3659C9] transition"
                  onClick={handleConfirmScript}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {stage === "loadingSplit" && (
          <div className="mt-8 flex flex-col items-center">
            {/* Bot with Loading Animation */}
            <div className="relative">
              {/* Bot Icon */}
              <Bot className="w-20 h-20 text-gray-900" />

              {/* Spinner on Top Right  */}
              <Loader2 className="absolute -top-2 right-0 w-6 h-6 text-blue-500 animate-spin" />
            </div>

            {/* Loading Text */}
            <p className="text-center mt-4 text-lg font-semibold text-gray-700">
              Loading...
            </p>
          </div>
        )}

        {stage === "selectVoice" || stage === "loadingFinal" ? (
          <div className={`mt-8 transition-opacity duration-500 ${stage === "loadingFinal" ? "opacity-0" : "opacity-100"}`}>
            <ProgressIndicator currentStage={2} />

            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Pick the perfect AI voice to bring your video to life!</h2>
                <p className="text-gray-600">Different voices create different moods. Choose the one that best fits your video style.</p>
              </div>

              <div className="space-y-4">
                {voiceOptions.map((voice) => (
                  <div
                    key={voice.name}
                    className="flex items-center justify-between p-4 border rounded-lg shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{voice.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {voice.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-full border border-[#4771F4] text-[#4771F4] text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        {voice.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        className={`w-10 h-10 flex items-center justify-center rounded-full border transition ${selectedVoice === voice.id
                          ? "bg-[#4771F4] text-white border-[#4771F4]"
                          : "bg-white text-[#4771F4] border-[#4771F4]"
                          }`}
                        onClick={() => setSelectedVoice(voice.id)}
                      >
                        ✔
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="w-[158.425px] h-[49.617px] rounded-[174.094px] bg-[#4771F4] text-white text-lg font-medium flex-shrink-0 hover:bg-[#3659C9] transition"
                  onClick={handleGenerateVideo}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {stage === "loadingFinal" && (
          <div className="mt-8 flex flex-col items-center">
            {/* Bot with Loading Animation */}
            <div className="relative">
              {/* Bot Icon */}
              <Bot className="w-20 h-20 text-gray-900" />

              {/* Spinner on Top Right  */}
              <Loader2 className="absolute -top-2 right-0 w-6 h-6 text-blue-500 animate-spin" />
            </div>

            {/* Loading Text */}
            <p className="text-center mt-4 text-lg font-semibold text-gray-700">
              Loading Final Video...
            </p>
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
    </div>
  );
}