import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://railthailand.com";

function getCities() {
  const citiesDir = path.join(process.cwd(), "data", "city-schedules");
  const files = fs.readdirSync(citiesDir);
  
  const cities = new Set<string>();
  
  files.forEach((file) => {
    if (file.endsWith(".json")) {
      cities.add(file.toLowerCase().replace(".json", ""));
    }
  });
  
  return Array.from(cities);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const cities = getCities();

  return cities.map((city) => ({
    url: `${BASE_URL}/cities/${city}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}