import { useState } from "react";

export default function Home() {
  const [music, setMusic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateMusic = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (response.status === 503) {
        throw new Error("Model is loading, please try again in a few seconds");
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate music");
      }

      if (!data.music) {
        throw new Error("No music generated");
      }

      setMusic(data.music);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">AI Music Generator</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt (e.g., 'happy electronic music')"
          className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg mb-4"
        />
        <button
          onClick={generateMusic}
          disabled={isLoading || !prompt}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? (
            <span>Loading Model... Please Wait</span>
          ) : (
            "Generate Music"
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            {error.includes("loading") && (
              <button 
                onClick={generateMusic}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {music && (
          <div className="mt-8">
            <audio controls className="w-full" key={music}>
              <source src={music} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
