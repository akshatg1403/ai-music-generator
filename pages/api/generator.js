export default async function handler(req, res) {
  if (!process.env.HUGGING_FACE_TOKEN) {
    return res.status(500).json({ error: "Token not configured" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.HUGGING_FACE_TOKEN;
  console.log("Token starts with:", token.substring(0, 3)); // This will show "hf_" if token is correct

  try {
    const { prompt } = req.body;
    console.log("Processing prompt:", prompt);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          options: {
            wait_for_model: true
          }
        }),
      }
    );

    // Log response status
    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    return res.status(200).json({ music: audioUrl });

  } catch (error) {
    console.error("Full error:", error);
    return res.status(500).json({ 
      error: "Music generation failed",
      message: error.message,
      tokenPrefix: token.substring(0, 3)
    });
  }
}
