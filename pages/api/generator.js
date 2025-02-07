import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const { prompt } = req.body;
      
      console.log("Starting generation with prompt:", prompt);

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

      console.log("Generation output:", output);

      res.status(200).json({ music: output });
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
