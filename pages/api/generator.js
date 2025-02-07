export default async function handler(req, res) {
  // Validate token
  if (!process.env.HUGGING_FACE_TOKEN) {
    return res.status(500).json({ error: "Hugging Face token not configured" });
  }

  // Validate method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    console.log("Starting generation with prompt:", prompt);

    // First check if model is ready
    const statusResponse = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
        },
      }
    );

    if (statusResponse.status === 503) {
      return res.status(503).json({ 
        error: "Model is loading, please try again in a few seconds" 
      });
    }

    // Make the actual generation request
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            wait_for_model: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`API call failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    return res.status(200).json({ music: audioUrl });

  } catch (error) {
    console.error("Generation error:", error);
    return res.status(500).json({ 
      error: "Music generation failed",
      message: error.message
    });
  }
}
