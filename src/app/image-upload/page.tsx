"use client";

import { useState, FormEvent, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { useThemeColor } from "@/hooks/useThemeColor";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Simulate weight detection (in a real app, this would be done via API)
      simulateWeightDetection();
    }
  };

  const simulateWeightDetection = () => {
    setIsProcessing(true);

    // Simulate a delay to mimic API processing
    setTimeout(() => {
      // Generate a random weight between 70 and 100 with one decimal place
      const randomWeight = (Math.random() * 30 + 70).toFixed(1);
      setDetectedWeight(randomWeight);
      setIsProcessing(false);
      setSuccess("Weight detected from image!");
    }, 1500);
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
      </p>
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
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
          </div>

          {isProcessing && !detectedWeight && (
            <div className="flex flex-col items-center justify-center py-4">
              <div
                className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${primaryBorder} mb-2`}
              ></div>
              <p>Processing image...</p>
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
