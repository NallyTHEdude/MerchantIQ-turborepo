import { config } from "@/config";
import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "./schemas/relations";

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: config.DATABASE_URL,
    ssl: true,
  },
  relations,
});

export const connectDB = async () => {
  try {
    await db.execute(`SELECT 1`);
    console.log("----------|Database connection successful|----------");
  } catch (error) {
    console.error("!!!!!-----|Database connection failed|-----!!!!!", error);
    process.exit(1);
    throw new Error("Server Terminated: Database connection failed.", {
      cause: error,
    });
  }
};
