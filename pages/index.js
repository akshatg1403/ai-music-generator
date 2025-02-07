import { useState } from "react";

export default function Home() {
  const [music, setMusic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateMusic = async () => {
    setIsLoading(true);
    setError("");
    console.log("Starting music generation with prompt:", prompt);

    try {
      const response = await fetch("/api/generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate music");
      }

      if (data.music) {
        console.log("Setting music URL:", data.music);
        setMusic(data.music);
      } else {
        throw new Error("No music URL in response");
      }
    } catch (error) {
      console.error("Error details:", error);
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
          {isLoading ? "Generating..." : "Generate Music"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {music && (
          <div className="mt-8">
            <audio controls className="w-full" key={music}>
              <source src={music} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
            <p className="mt-2 text-sm text-gray-600">
              If audio doesn't play, <a href={music} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">click here to download</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
