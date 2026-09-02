import { config } from "@/config/env";
import { Firecrawl } from "firecrawl";

export const firecrawl = new Firecrawl({
  apiKey: config.FIRECRAWL_API_KEY,
});
