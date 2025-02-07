export default async function handler(req, res) {
  if (!process.env.HUGGING_FACE_TOKEN) {
    return res.status(500).json({ error: "Token not configured" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const maxRetries = 3;
  let currentTry = 0;

  async function attemptGeneration() {
    const { prompt } = req.body;
    console.log(`Attempt ${currentTry + 1} with prompt:`, prompt);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            wait_for_model: true,
            max_new_tokens: 250
          }
        }),
      }
    );

    if (response.status === 503) {
      const errorText = await response.text();
      console.log("Model loading, waiting to retry...");
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
      throw new Error("Model is loading");
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response;
  }

  try {
    let response;
    while (currentTry < maxRetries) {
      try {
        response = await attemptGeneration();
        break; // If successful, break the loop
      } catch (error) {
        currentTry++;
        if (currentTry === maxRetries) {
          throw error; // If all retries failed, throw the error
        }
        // If it's not the last try, continue the loop
        console.log(`Retry ${currentTry}/${maxRetries}`);
      }
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    return res.status(200).json({ music: audioUrl });

  } catch (error) {
    console.error("Final error:", error);
    return res.status(500).json({ 
      error: error.message,
      details: "Please try again in a few seconds"
    });
  }
}
