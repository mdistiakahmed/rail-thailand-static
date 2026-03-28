import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";

export const dynamic = "force-static";
const BASE_URL = "https://railthailand.com";

function getStations() {

  const jsonPath = path.join(
    process.cwd(),
    "data",
    "trains-by-stations",
    "all-trips.json"
  );

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const stations = new Set<string>();

  data.routes.forEach((route: any) => {
    const [start] = route.route.split(" - ");

    const slug = start
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    stations.add(slug);
  });

  return Array.from(stations);
}

export default function sitemap(): MetadataRoute.Sitemap {

  const stations = getStations();

  return stations.map((station) => ({
    url: `${BASE_URL}/stations/${station}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}