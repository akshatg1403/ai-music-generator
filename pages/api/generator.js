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
        }),
      }
    );

    console.log("Response status:", response.status);

    // If model is loading
    if (response.status === 503) {
      return res.status(503).json({ 
        error: "Model is loading, please try again in a few seconds" 
      });
    }

    // If unauthorized
    if (response.status === 401) {
      return res.status(401).json({ 
        error: "Unauthorized. Please check your Hugging Face token." 
      });
    }

    // For any other non-200 response
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      return res.status(500).json({ 
        error: `API call failed: ${response.status}`,
        details: errorText
      });
    }

    // Get the response as array buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Log the size of received data
    console.log("Received audio buffer size:", audioBuffer.byteLength);

    // If we got an empty response
    if (audioBuffer.byteLength === 0) {
      return res.status(500).json({ 
        error: "Received empty response from API" 
      });
    }

    // Convert to base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    return res.status(200).json({ music: audioUrl });

  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      error: "Music generation failed",
      details: error.message
    });
  }
}
