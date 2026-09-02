import { healthCheckRepository } from "@/app/repositories/health.repository";
import { config } from "@/config/env";
import { firecrawl } from "@/config/firecrawl-scraper/client";

export const healthCheckService = async () => {
  const [database, firecrawlHealth, mlServer, inngest] = await Promise.all([
    checkDatabase(),
    checkFirecrawl(),
    checkMlServer(),
    checkInngest(),
  ]);

  const allHealthy = database && firecrawlHealth && mlServer && inngest;

  return {
    status: allHealthy ? "healthy" : "degraded",
    services: {
      database: database ? "healthy" : "unhealthy",
      firecrawl: firecrawlHealth ? "healthy" : "unhealthy",
      mlServer: mlServer ? "healthy" : "unhealthy",
      inngest: inngest ? "healthy" : "unhealthy",
    },
  };
};

const checkDatabase = async (): Promise<boolean> => {
  try {
    await healthCheckRepository();
    return true;
  } catch {
    return false;
  }
};

const checkFirecrawl = async (): Promise<boolean> => {
  try {
    // Lightweight Firecrawl request
    await firecrawl.scrape("https://example.com", {
      formats: ["markdown"],
    });

    return true;
  } catch {
    return false;
  }
};

const checkMlServer = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${config.ML_SERVICE_URL}/health`);

    return response.ok;
  } catch {
    return false;
  }
};

const checkInngest = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${config.BASE_URL}:8288/health`);

    return response.status >= 200;
  } catch {
    return false;
  }
};
