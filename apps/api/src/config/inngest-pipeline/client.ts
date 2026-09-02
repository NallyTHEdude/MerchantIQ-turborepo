import { config } from "@/config/env";
import { Inngest } from "inngest";

export const inngestClient = new Inngest({
  id: "inngest-client",
  isDev: config.NODE_ENV === "development",
});
