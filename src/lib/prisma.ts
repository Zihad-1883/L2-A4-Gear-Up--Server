import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma, Role } from "../generated/prisma/index.js";
import config from "../config";

const connectionString = process.env.DATABASE_URL || config.DATABASE_URL;
const maskedUrl = connectionString ? connectionString.replace(/:([^@]+)@/, ":****@") : "NONE";
console.log(`[Database] Connecting to: ${maskedUrl}`);

if (!process.env.DATABASE_URL) {
  console.warn("[Database WARNING] process.env.DATABASE_URL is missing!");
}

let dbHost: string | undefined;
try {
  if (connectionString) {
    dbHost = new URL(connectionString).hostname;
  }
} catch (e) {
  // Ignore URL parse error
}

const isLocalhost = connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1");

const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  ssl: isLocalhost
    ? false
    : {
        rejectUnauthorized: false,
        servername: dbHost || undefined,
      },
});

pool.on("error", (err) => {
  console.error("[pg.Pool Error] Idle client error:", err.message);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma, Prisma, Role };
