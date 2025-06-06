"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { useThemeColor } from "@/hooks/useThemeColor";
import { analyzeScaleImage, ImageAnalysisError } from "@/lib/image-utils";

export default function ImageUploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [detectedWeight, setDetectedWeight] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const primaryBorder = useThemeColor("Border", "Primary");
  const onSecondary = useThemeColor("On", "Secondary");
  const fileBackground = useThemeColor("Background", "File");
  const fileText = useThemeColor("Text", "File");
  const fileHoverBackground = useThemeColor("Hover Background", "File");
  const fileHoverText = useThemeColor("Hover Text", "File");
  const hoverBorder = useThemeColor("Border Hover", "Assets");
  const assetFocusRing = useThemeColor("Focus Ring", "Assets");
  const primaryText = useThemeColor("Text", "Primary");
  const primaryTextHover = useThemeColor("Text Hover", "Primary");
  // Check if user has configured their OpenAI API key
  useEffect(() => {
    async function checkApiKey() {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/settings");
          if (response.ok) {
            const data = await response.json();
            setHasApiKey(!!data.settings?.openaiApiKey);
          }
        } catch (error) {
          console.error("Error checking API key:", error);
        }
      }
    }
    
    checkApiKey();
  }, [session]);

  // Redirect to login page if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center p-8">
        <div
          className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${primaryBorder}`}
        ></div>
      </div>
    );
  }
  // Don't render content if not authenticated
  if (!session) {
    return null;
  }
  
    // Show a message if the user hasn't set up their OpenAI API key
  if (hasApiKey === false) {
    return (
      <div>
        <h1 className={`text-2xl font-bold mb-6 ${onSecondary}`}>
          Scale Image Upload
        </h1>
        <Card>
          <div className="p-4">
            <Alert variant="error" className="mb-4">
              OpenAI API Key Required
            </Alert>
            <p className="mb-4">
              To use the image analysis feature, you need to add your OpenAI API key in the settings.
            </p>
            <div className="mb-4">
              <h3 className="font-medium mb-2">How to get your API key:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Sign up or log in to your OpenAI account at <a href="https://platform.openai.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a></li>
                <li>Navigate to API keys in your account settings</li>
                <li>Click "Create new secret key" and copy the key</li>
                <li>Paste the key in your app settings</li>
              </ol>
            </div>
            <Link href="/settings">
              <Button type="button">
                Go to Settings
              </Button>
            </Link>
          </div>
        </Card>
        <div className="mt-8">
          <Link
            href="/"
            className={`${primaryText} ${primaryTextHover} hover:underline`}
          >
            ← Back to manual data entry
          </Link>
        </div>
      </div>
    );
  }
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    setDetectedWeight(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Basic validation for image types
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      // Process the image with the real OpenAI Vision API
      await processImageWithVisionAPI(file);
    }
  };
  const processImageWithVisionAPI = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Use the utility function to analyze the image
      const weight = await analyzeScaleImage(file);
      
      // Set the detected weight with one decimal place
      setDetectedWeight(weight.toFixed(1));
      setSuccess("Weight detected from image!");
    } catch (error) {
      console.error("Error analyzing image:", error);
      
      // Check if it's our custom error type with an error code
      if (error instanceof ImageAnalysisError) {
        const errorCode = error.code;
        const errorMessage = error.message;
        
        // Handle specific error codes from OpenAI
        if (errorCode === "insufficient_quota" || errorCode === "billing_hard_limit_reached") {
          setError(`OpenAI API quota exceeded. Please check your account billing at OpenAI website.`);
        } else if (errorCode === "rate_limit_exceeded") {
          setError(`Rate limit exceeded. Please wait a moment and try again.`);
        } else if (errorCode === "invalid_api_key") {
          setError(`Invalid API key. Please update your API key in settings.`);
          setHasApiKey(false);
        } else if (errorCode === "invalid_request_error") {
          setError(`Invalid image format or content. Please try a clearer image of your scale.`);
        } else if (errorMessage.includes("API key") || errorMessage.toLowerCase().includes("openai")) {
          // Check if the error is related to missing API key
          setHasApiKey(false);
        } else {
          // For other codes, show both message and code
          setError(errorCode ? `${errorMessage} (Error: ${errorCode})` : errorMessage);
        }
      } else {
        // Fallback for regular errors
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze image";
        
        // Check if the error is related to missing API key
        if (errorMessage.includes("API key") || errorMessage.toLowerCase().includes("openai")) {
          setHasApiKey(false);
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!detectedWeight) {
      setError("No weight detected from image");
      return;
    }

    setIsProcessing(true);

    try {
      // Submit to API (same endpoint as manual weight entry)
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: parseFloat(detectedWeight),
          notes: notes ? `Image upload: ${notes}` : "Image upload",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save entry");
      }

      // Success!
      setDetectedWeight(null);
      setNotes("");
      setImage(null);
      setSuccess("Entry saved successfully!");
      // Reset all file inputs
      const cameraInput = document.getElementById(
        "camera-input"
      ) as HTMLInputElement;
      const galleryInput = document.getElementById(
        "gallery-input"
      ) as HTMLInputElement;

      if (cameraInput) {
        cameraInput.value = "";
      }

      if (galleryInput) {
        galleryInput.value = "";
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleReset = () => {
    setImage(null);
    setDetectedWeight(null);
    setNotes("");
    setError(null);
    setSuccess(null);

    // Reset all file inputs
    const cameraInput = document.getElementById(
      "camera-input"
    ) as HTMLInputElement;
    const galleryInput = document.getElementById(
      "gallery-input"
    ) as HTMLInputElement;

    if (cameraInput) {
      cameraInput.value = "";
    }

    if (galleryInput) {
      galleryInput.value = "";
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      {" "}
      <h1 className={`text-2xl font-bold mb-6 ${onSecondary}`}>
        Scale Image Upload
      </h1>
      <p className="mb-6">
        Take a new picture or upload an existing photo of your bathroom scale
        and we'll automatically detect the weight value.
      </p>      {error && (
        <Alert variant="error" className="mb-4">
          <div>
            <p className="font-medium">{error}</p>
            {error.includes('insufficient_quota') && (
              <div className="mt-2 text-sm space-y-2 bg-red-50 p-3 rounded-md border border-red-100">
                <p className="font-medium">Your OpenAI account has reached its quota limit.</p>
                <p>This usually happens when:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>You're using a free trial that has expired</li>
                  <li>You've reached your monthly spending limit</li>
                  <li>Your billing information needs to be updated</li>
                </ul>
                <p className="mt-2">
                  <a 
                    href="https://platform.openai.com/account/billing" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View your OpenAI billing settings →
                  </a>
                </p>
              </div>
            )}
            {error.includes('rate_limit_exceeded') && (
              <div className="mt-2 text-sm space-y-2 bg-red-50 p-3 rounded-md border border-red-100">
                <p className="font-medium">Rate limit exceeded</p>
                <p>You've made too many requests in a short time. OpenAI limits how many requests you can make per minute.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Wait 30-60 seconds before trying again</li>
                  <li>If you continue seeing this error, try again later</li>
                </ul>
              </div>
            )}
            {error.includes('invalid_api_key') && (
              <div className="mt-2 text-sm space-y-2 bg-red-50 p-3 rounded-md border border-red-100">
                <p className="font-medium">Invalid API Key</p>
                <p>The API key you've provided is not valid. This can happen if:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The key was not copied correctly or has extra characters</li>
                  <li>The key has been revoked or deleted from your OpenAI account</li>
                  <li>The key doesn't have permission to use the required models</li>
                </ul>
                <p className="mt-2">
                  <Link 
                    href="/settings" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Update your API key in Settings →
                  </Link>
                </p>
              </div>
            )}
            {error.includes('invalid_request_error') && (
              <div className="mt-2 text-sm space-y-2 bg-red-50 p-3 rounded-md border border-red-100">
                <p className="font-medium">Invalid Request</p>
                <p>There was a problem with the image you uploaded. This can happen if:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The image file is corrupted or in an unsupported format</li>
                  <li>The image is too large (maximum file size is 20MB)</li>
                  <li>The image doesn't clearly show a weight scale display</li>
                </ul>
                <p>Try taking a clearer photo with good lighting, making sure the scale display is clearly visible.</p>
              </div>
            )}
            {error.includes('model_not_found') && (
              <div className="mt-2 text-sm space-y-2 bg-red-50 p-3 rounded-md border border-red-100">
                <p className="font-medium">Model Not Found</p>
                <p>Your OpenAI account doesn't have access to the required model. This can happen if:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>You're using a new account that doesn't have access to GPT-4 Vision</li>
                  <li>Your account tier doesn't include the required models</li>
                </ul>
                <p className="mt-2">
                  <a 
                    href="https://platform.openai.com/account" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Check your OpenAI account status →
                  </a>
                </p>
              </div>
            )}
          </div>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}{" "}
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className={`font-medium mb-4 ${onSecondary}`}>
              Choose an option
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Hidden file input for camera */}
              <input
                type="file"
                id="camera-input"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />

              {/* Hidden file input for gallery selection */}
              <input
                type="file"
                id="gallery-input"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Button for camera */}
              <Button
                type="button"
                onClick={() => document.getElementById("camera-input")?.click()}
                className="flex items-center justify-center gap-2 flex-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Take Photo
              </Button>

              {/* Button for gallery */}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById("gallery-input")?.click()
                }
                className="flex items-center justify-center gap-2 flex-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Choose from Gallery
              </Button>
            </div>
          </div>          {isProcessing && !detectedWeight && (
            <div className="flex flex-col items-center justify-center py-4">
              <div
                className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${primaryBorder} mb-2`}
              ></div>
              <p>Processing image with AI vision analysis...</p>
              <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
            </div>
          )}

          {image && (
            <div className="space-y-4">
              <div className="relative w-full h-64 border rounded-md overflow-hidden">
                <Image
                  src={image}
                  alt="Scale preview"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>

              {detectedWeight && (
                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <FormInput
                        type="number"
                        id="detectedWeight"
                        label="Detected Weight"
                        step="0.1"
                        value={detectedWeight}
                        onChange={(e) => setDetectedWeight(e.target.value)}
                        required
                      />
                      <p className="text-xs mt-1">
                        You can edit this value if the detection is not
                        accurate.
                      </p>
                    </div>

                    <FormInput
                      type="text"
                      id="notes"
                      label="Notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any relevant notes"
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isProcessing || !detectedWeight}
                        isLoading={isProcessing}
                        className="flex-1"
                      >
                        Save Entry
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      <div className="mt-8">
        <Link
          href="/"
          className={`${primaryText} ${primaryTextHover} hover:underline`}
        >
          ← Back to manual data entry
        </Link>
      </div>
    </div>
  );
}
