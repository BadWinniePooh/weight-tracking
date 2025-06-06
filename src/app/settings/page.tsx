"use client";

import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

export default function SettingsPage() {  const [settings, setSettings] = useState({
    weightGoal: "",
    lossRate: "0.0055",
    carbFatRatio: "0.6",
    bufferValue: "0.0075",
    openaiApiKey: "",
    aiProvider: "openai",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const session = await getSession();
        // Don't render content if not authenticated
        if (!session) {
          return null;
        }

        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {              setSettings({
              weightGoal: data.settings.weightGoal?.toString() || "",              
              lossRate: data.settings.lossRate?.toString() || "0.0055",
              carbFatRatio: data.settings.carbFatRatio?.toString() || "0.6",
              bufferValue: data.settings.bufferValue?.toString() || "0.0075",
              openaiApiKey: data.settings.openaiApiKey || "",
              aiProvider: data.settings.aiProvider || "openai",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weightGoal: settings.weightGoal
            ? parseFloat(settings.weightGoal)
            : null,
          lossRate: settings.lossRate ? parseFloat(settings.lossRate) : null,
          carbFatRatio: settings.carbFatRatio
            ? parseFloat(settings.carbFatRatio)
            : null,          bufferValue: settings.bufferValue
            ? parseFloat(settings.bufferValue)
            : null,
          openaiApiKey: settings.openaiApiKey,
          aiProvider: settings.aiProvider,
        }),
      });

      if (response.ok) {
        setMessage("Settings saved successfully!");
        setMessageType("success");
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to save settings");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("An error occurred while saving settings");
      setMessageType("error");
    } finally {
      setLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>

      {message && (
        <Alert
          variant={messageType === "success" ? "success" : "error"}
          className="mb-6"
        >
          {message}
        </Alert>
      )}

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <FormInput
            type="number"
            id="weightGoal"
            name="weightGoal"
            label="Weight Goal"
            step="0.1"
            value={settings.weightGoal}
            onChange={handleChange}
            placeholder="Enter your target weight"
            description="Your target weight in the same units as your entries"
          />

          <FormInput
            type="number"
            id="lossRate"
            name="lossRate"
            label="Weight Loss Rate"
            step="0.01"
            value={settings.lossRate}
            onChange={handleChange}
            placeholder="Enter desired weight loss rate"
            description="Desired weight loss per week"
          />

          <FormInput
            type="number"
            id="carbFatRatio"
            name="carbFatRatio"
            label="Carb/Fat Ratio"
            step="0.01"
            value={settings.carbFatRatio}
            onChange={handleChange}
            placeholder="Enter your preferred carb/fat ratio"
            description="Your preferred ratio of carbohydrates to fats"
          />

          <FormInput
            type="number"
            id="bufferValue"
            name="bufferValue"
            label="Buffer Value"
            step="0.1"
            value={settings.bufferValue}
            onChange={handleChange}
            placeholder="Enter buffer value"
            description="Buffer value for your weight loss calculations"          />          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          
          <h3 className="font-medium mb-2">AI Image Analysis</h3>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm">
              The scale image analyzer uses AI to detect weight values from images. 
              You can choose between OpenAI&apos;s Vision API or a locally hosted Ollama instance.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">AI Provider</label>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="aiProvider"
                  value="openai"
                  checked={settings.aiProvider === "openai"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>OpenAI (requires API key)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="aiProvider"
                  value="ollama"
                  checked={settings.aiProvider === "ollama"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Local Ollama (llava:7b model)</span>
              </label>
            </div>
          </div>
          
          {settings.aiProvider === "openai" && (
            <>
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm mt-2">
                  <Link href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 dark:text-blue-400 underline">
                    Get an API key from OpenAI →
                  </Link>
                </p>
              </div>
              <FormInput
                label="OpenAI API Key"
                type="password"
                name="openaiApiKey"
                id="openaiApiKey"
                value={settings.openaiApiKey}
                onChange={handleChange}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                description="Required for OpenAI. Your API key is stored securely and used only for analyzing your scale images."
              />
              <div className="mt-2 text-xs text-gray-500">
                <p>Note: Using the OpenAI API is a paid service. Check your <a href="https://platform.openai.com/account/usage" target="_blank" className="underline">usage</a> periodically.</p>
              </div>
            </>
          )}
          
          {settings.aiProvider === "ollama" && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-sm">
                Using the local Ollama instance with llava:7b model at localhost:11434. No API key required.
              </p>
              <p className="text-sm mt-2">
                Make sure your Ollama instance is running and has the llava:7b model installed.
              </p>
            </div>
          )}

          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
            fullWidth
          >
            Save Settings
          </Button>
        </form>
      </Card>

      {/* Data Management Section */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Import Data</h3>
            <p className="text-sm mb-3">
              Import historic data from Excel spreadsheets with structured
              measurement data.
            </p>
            <Link href="/import">
              <Button variant="primary" className="inline-flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                Import from Excel
              </Button>
            </Link>
          </div>

          {/* Room for future data management options */}
        </div>
      </Card>
    </div>
  );
}
