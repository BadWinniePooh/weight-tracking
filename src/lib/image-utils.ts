// Helper functions for image processing and analysis

/**
 * Uploads an image file to the server and analyzes it using the configured AI provider
 * @param imageFile - The image file to upload
 * @returns The detected weight and provider information
 */
/**
 * Custom error type for image analysis with error code
 */
export class ImageAnalysisError extends Error {
  code: string | null;
  
  constructor(message: string, code: string | null = null) {
    super(message);
    this.name = 'ImageAnalysisError';
    this.code = code;
  }
}

export interface ImageAnalysisResult {
  weight: number;
  provider: string;
  rawResponse?: string;
}

export async function analyzeScaleImage(imageFile: File): Promise<ImageAnalysisResult> {
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
      // Throw a custom error with the error code if available
      throw new ImageAnalysisError(
        data.error || "Failed to analyze image", 
        data.errorCode || null
      );
    }
      const result = await response.json();
    return {
      weight: result.weight,
      provider: result.provider || 'openai',
      rawResponse: result.rawResponse
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    
    // If it's already our custom error type, just re-throw it
    if (error instanceof ImageAnalysisError) {
      throw error;
    }
    
    // Otherwise wrap it in our custom error
    throw new ImageAnalysisError(
      error instanceof Error ? error.message : "Unknown error occurred",
      null
    );
  }
}
