import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || "",
  });

  console.log("API Token present:", !!process.env.REPLICATE_API_TOKEN);
  
  try {
    const { prompt } = req.body;
    console.log("Received prompt:", prompt);

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    const output = await replicate.run(
      "meta/musicgen:7be0f12c54a8d033a0fbd14418c9af98962da9a86f5ff7811f9b3423a1f0b7d7",
      {
        input: {
          prompt: prompt,
          duration: 8,
          model_version: "melody",
          output_format: "wav"
        }
      }
    );

    console.log("Generation successful, output:", output);
    return res.status(200).json({ music: output });

  } catch (error) {
    console.error("Detailed error:", error);
    return res.status(500).json({ 
      error: "Music generation failed", 
      details: error.message 
    });
  }
}
