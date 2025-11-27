import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

// Declare a global variable for the PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize SQLite adapter with database URL
const databaseUrl = process.env.DATABASE_URL?.replace("file:", "") || "./dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

// Initialize the PrismaClient with the adapter
export const prisma = global.prisma || new PrismaClient({ adapter });

// Store the client instance in the global variable in development mode
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
