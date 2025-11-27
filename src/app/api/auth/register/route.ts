import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username: _username, email: _email, password } = await request.json();

    // Validate input data
    if (!_username || !_email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      {
        username: {
          equals: _username,
        },
      },
      {
        email: {
          equals: _email
        },
      },
    ],
  },
})

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 },
      );
    }

    // Hash the password
    const passwordHash = await hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        username: _username,
        email: _email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error during user registration:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 },
    );
  }
}
