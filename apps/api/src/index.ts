import app from "./app.js";
import { config } from "@/config/index";
import { connectDB } from "./db/index.js";
// import connectDB from "./db/index.js";
// import { logger } from "./utils/logger.js";
// import { connectRedis } from "./utils/redis.js";

const bootstrap = async () => {
  const PORT = config.PORT;
  const BASE_URL = config.BASE_URL;
  
  await connectDB();
  
  //app listener
  app.listen(PORT, () => {
    console.log(`----------|Server is running at ${BASE_URL}:${PORT}|----------`);
  });

}

bootstrap().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});