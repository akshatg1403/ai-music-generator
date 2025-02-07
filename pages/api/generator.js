export default async function handler(req, res) {
  if (!process.env.HUGGING_FACE_TOKEN) {
    return res.status(500).json({ error: "Token not configured" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    console.log("Processing prompt:", prompt);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-melody",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 250
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      
      // Check if model is loading
      if (errorText.includes("loading")) {
        return res.status(503).json({ 
          error: "Model is loading, please try again in a few seconds" 
        });
      }
      
      throw new Error(`API call failed: ${response.status}`);
    }

    // Get the response as a blob
    const blob = await response.blob();
    
    // Convert blob to base64
    const buffer = await blob.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    return res.status(200).json({ music: audioUrl });

  } catch (error) {
    console.error("Full error:", error);
    return res.status(500).json({ 
      error: "Music generation failed",
      message: error.message
    });
  }
}
