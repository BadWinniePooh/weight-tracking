/**
 * Helper functions for interacting with the local Ollama API
 */

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  images?: string[];
}

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

/**
 * Sends an image analysis request to the local Ollama instance
 * @param imageBase64 Base64 encoded image data
 * @returns The extracted weight from the image or null if not detected
 */
export async function analyzeImageWithOllama(imageBase64: string): Promise<string> {
  //const prompt = "What is the weight shown on this scale display? Extract ONLY the weight value as a number (with decimal point if present). Return ONLY the number, nothing else. If you can't find a weight, reply with 'No weight detected'.";
  //const prompt = "What number do you see in the image? Extract ONLY the number value with decimal point if present. Return ONLY the number, nothing else. If you can't find a number, reply with 'No weight detected'."
  const prompt = "What do you see in the image?"
  
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llava:7b",
        prompt,
        stream: false,
        images: [imageBase64],
      } as OllamaGenerateRequest),
    });

    if (!response.ok) {
      console.error("Ollama API error:", response.status, response.statusText);
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OllamaGenerateResponse;
    return data.response;
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    throw new Error("Failed to analyze image with Ollama");
  }
}
