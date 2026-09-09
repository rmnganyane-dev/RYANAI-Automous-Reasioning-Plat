// File path: ./scripts/verify-env.ts

import { Pool } from "pg";
import { createClient } from "redis";

async function verifyEnvironment() {
  console.log("Verifying RyanAI infrastructure connections...");

  const dbPool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ryanai",
  });

  try {
    const dbRes = await dbPool.query("SELECT NOW()");
    console.log(" PostgreSQL connection verified:", dbRes.rows[0].now);
  } catch (err: any) {
    console.error(" PostgreSQL connection failed:", err.message);
  } finally {
    await dbPool.end();
  }

  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  try {
    await redisClient.connect();
    await redisClient.ping();
    console.log(" Redis cache connection verified.");
    await redisClient.disconnect();
  } catch (err: any) {
    console.error(" Redis connection failed:", err.message);
  }
}

verifyEnvironment();