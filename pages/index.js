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

      if (!response.ok) {
        throw new Error("Failed to generate music");
      }

      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.music) {
        setMusic(data.music);
      } else {
        setError("No music URL received");
      }
    } catch (error) {
      console.error("Failed to generate music:", error);
      setError("Failed to generate music");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">AI Music Generator</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt (e.g., 'happy electronic dance music')"
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
          <p className="text-red-500 mt-4">{error}</p>
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
