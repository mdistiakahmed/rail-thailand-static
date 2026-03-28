import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";

export const dynamic = "force-static";
const BASE_URL = "https://railthailand.com";

function getTrains() {
  const trainsDir = path.join(process.cwd(), "data", "trains-by-id");
  const files = fs.readdirSync(trainsDir);
  
  return files
    .filter((file) => file.startsWith("train-") && file.endsWith(".json"))
    .map((file) => file.replace("train-", "").replace(".json", ""));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const trains = getTrains();

  return trains.map((trainId) => ({
    url: `${BASE_URL}/trains/${trainId}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}