import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    const { prompt } = req.body;

    try {
      const output = await replicate.run(
        "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
        {
          input: {
            prompt_a: prompt
          },
        }
      );
      
      console.log("AI music generation output:", output);

      // Send the audio_out URL from the response
      res.status(200).json({ music: output.audio_out });
    } catch (error) {
      console.error("AI music generation failed:", error);
      res.status(500).json({ error: "AI music generation failed" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
