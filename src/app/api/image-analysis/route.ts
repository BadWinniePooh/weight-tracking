import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { analyzeImageWithOllama } from "@/lib/ollama";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // If not authenticated, return unauthorized
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }    // Get the user's settings
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        openaiApiKey: true,
        aiProvider: true,
      },
    });
    
    const aiProvider = userSettings?.aiProvider || "openai";
    
    // Check if using OpenAI but no API key provided
    if (aiProvider === "openai" && !userSettings?.openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not found in your settings. Please add your API key in the Settings page." },
        { status: 400 }
      );    }
    
    // Parse the multipart form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    
    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert the file to a base64 data URL
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");    const dataUrl = `data:${imageFile.type};base64,${base64Image}`;
    
    let resultText: string;
    
    // Use the selected AI provider
    if (aiProvider === "ollama") {
      // Use Ollama for image analysis
      try {
        resultText = await analyzeImageWithOllama(base64Image);
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { error: `Ollama API error: ${errorMsg}` },
          { status: 500 }
        );
      }
    } else {
      // Use OpenAI for image analysis
      const openai = new OpenAI({
        apiKey: userSettings?.openaiApiKey || "",
      });
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that reads weights from bathroom scale displays. Extract ONLY the weight value as a number (with decimal point if present). Return ONLY the number, nothing else. If you can't find a weight, reply with 'No weight detected'."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "What is the weight shown on this scale display? Please extract just the number." },
                { 
                  type: "image_url",
                  image_url: {
                    url: dataUrl,
                  },
                },
              ],
            },
          ],
        });
          resultText = response.choices[0]?.message?.content || "No weight detected";
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { error: `OpenAI API error: ${errorMsg}` },
          { status: 500 }
        );
      }
    }
    
    // Try to extract a valid number from the result
    const weightMatch = resultText.match(/\b\d+(\.\d+)?\b/);
    const detectedWeight = weightMatch ? parseFloat(weightMatch[0]) : null;
    
    if (!detectedWeight) {
      return NextResponse.json(
        { error: "No weight detected in the image" },
        { status: 400 }
      );
    }

    return NextResponse.json({      weight: detectedWeight,
      rawResponse: resultText,
      provider: aiProvider
    });  } catch (error: unknown) {    console.error("Error processing image:", error);
    
    // Extract error information from API response
    let errorMessage = "Error processing image";
    let errorCode: string | null = null;
    let statusCode = 500;
    
    // Type guard to handle OpenAI-like API errors
    interface OpenAIErrorResponse {
      response?: { data?: { error?: { code?: string; type?: string; message?: string } } };
      error?: { code?: string; message?: string };
      code?: string;
      message?: string;
      type?: string;
      status?: number;
    }
    
    if (typeof error === 'object' && error !== null) {
      const err = error as OpenAIErrorResponse;
      
      if (err.response?.data?.error) {
        // Handle standard OpenAI API error format
        const apiError = err.response.data.error;
        errorCode = apiError.code || apiError.type || null;
        errorMessage = apiError.message || errorMessage;
      } else if (err.error?.code) {
        // Handle alternative error structure
        errorCode = err.error.code || null;
        errorMessage = err.error.message || errorMessage;
      } else if (err.code) {
        // Handle direct error code
        errorCode = err.code;
        errorMessage = err.message || errorMessage;
      } else {
        // Try to extract any useful information from the error object
        errorCode = err.code || err.type || (err.status ? String(err.status) : null);
        errorMessage = err.message || errorMessage;
      }
      
      // Try to get status code if available
      if (err.status) {
        statusCode = err.status;
      }
    }
    
    // Return detailed error information
    return NextResponse.json(
      { 
        error: errorMessage,
        errorCode: errorCode
      },
      { status: statusCode }
    );
  }
}
