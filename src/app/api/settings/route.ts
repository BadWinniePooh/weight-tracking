import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Default values
const DEFAULT_LOSS_RATE = 0.0055;
const DEFAULT_CARB_FAT_RATIO = 0.6;
const DEFAULT_BUFFER_VALUE = 0.0075;

// GET: Fetch user settings
export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    // Apply default values if settings don't exist or values are null
    const responseSettings = settings
      ? {
          ...settings,
          lossRate: settings.lossRate ?? DEFAULT_LOSS_RATE,
          carbFatRatio: settings.carbFatRatio ?? DEFAULT_CARB_FAT_RATIO,
          bufferValue: settings.bufferValue ?? DEFAULT_BUFFER_VALUE,
          aiProvider: settings.aiProvider ?? "openai",
        }
      : {
          lossRate: DEFAULT_LOSS_RATE,
          carbFatRatio: DEFAULT_CARB_FAT_RATIO,
          bufferValue: DEFAULT_BUFFER_VALUE,
          aiProvider: "openai",
        };

    return NextResponse.json({ settings: responseSettings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// POST: Create or update user settings
export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get data from request body
    const {
      weightGoal,
      lossRate = DEFAULT_LOSS_RATE,
      carbFatRatio = DEFAULT_CARB_FAT_RATIO,
      bufferValue = DEFAULT_BUFFER_VALUE,
      openaiApiKey,
      aiProvider = "openai",
    } = await req.json();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert user settings (create if doesn't exist or update if exists)
    const updatedSettings = await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        weightGoal,
        lossRate,
        carbFatRatio,
        bufferValue,
        openaiApiKey,
        aiProvider,
      },
      create: {
        userId: user.id,
        weightGoal,
        lossRate,
        carbFatRatio,
        bufferValue,
        openaiApiKey,
        aiProvider,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
