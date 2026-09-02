import { db } from "@/db";

export const healthCheckRepository = async () => {
  return  db.execute(`SELECT 1`).then(() => true).catch(() => false);
}