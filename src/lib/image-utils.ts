// Helper functions for image processing and analysis

/**
 * Uploads an image file to the server and analyzes it using OpenAI Vision API
 * @param imageFile - The image file to upload
 * @returns The detected weight value
 */
export async function analyzeScaleImage(imageFile: File): Promise<number> {
  try {
    // Create form data for the API request
    const formData = new FormData();
    formData.append("image", imageFile);
    
    // Send the image to our API endpoint
    const response = await fetch("/api/image-analysis", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to analyze image");
    }
    
    const result = await response.json();
    return result.weight;
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
}
