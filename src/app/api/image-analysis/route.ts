import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // If not authenticated, return unauthorized
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the user's API key from their settings
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        openaiApiKey: true,
      },
    });
    
    if (!userSettings?.openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not found in your settings. Please add your API key in the Settings page." },
        { status: 400 }
      );
    }
    
    // Initialize OpenAI client with the user's API key
    const openai = new OpenAI({
      apiKey: userSettings.openaiApiKey,
    });
    
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
    const base64Image = buffer.toString("base64");
    const dataUrl = `data:${imageFile.type};base64,${base64Image}`;
    
    // Call OpenAI Vision API to analyze the scale image
    const response = await openai.chat.completions.create({
      //model: "gpt-4.1",
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

    const resultText = response.choices[0]?.message?.content || "No weight detected";
    
    // Try to extract a valid number from the result
    const weightMatch = resultText.match(/\b\d+(\.\d+)?\b/);
    const detectedWeight = weightMatch ? parseFloat(weightMatch[0]) : null;
    
    if (!detectedWeight) {
      return NextResponse.json(
        { error: "No weight detected in the image" },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      weight: detectedWeight,
      rawResponse: resultText 
    });  } catch (error: any) {
    console.error("Error processing image:", error);
    
    // Extract error information from OpenAI API error response
    let errorMessage = "Error processing image";
    let errorCode = null;
    
    if (error?.response?.data?.error) {
      // Handle standard OpenAI API error format
      const apiError = error.response.data.error;
      errorCode = apiError.code || apiError.type;
      errorMessage = apiError.message || errorMessage;
    } else if (error?.error?.code) {
      // Handle alternative error structure
      errorCode = error.error.code;
      errorMessage = error.error.message || errorMessage;
    } else if (error?.code) {
      // Handle direct error code
      errorCode = error.code;
      errorMessage = error.message || errorMessage;
    } else if (typeof error === 'object' && error !== null) {
      // Try to extract any useful information from the error object
      errorCode = error.code || error.type || error.status;
      errorMessage = error.message || error.error || errorMessage;
    }
    
    // Return detailed error information
    return NextResponse.json(
      { 
        error: errorMessage,
        errorCode: errorCode
      },
      { status: error.status || 500 }
    );
  }
}
