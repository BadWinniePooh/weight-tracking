import { PrismaClient } from "@prisma/client";

// Declare a global variable for the PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize the PrismaClient with a Singleton pattern
const prismaClientOptions = {};
export const prisma = global.prisma || new PrismaClient(prismaClientOptions);

// Store the client instance in the global variable in development mode
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
