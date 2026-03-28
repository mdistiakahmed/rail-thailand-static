import { MetadataRoute } from "next";

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {

  
  const totalChunks = 31;  // Assuming 31,000 pages / 1,000 per page = 7 chunks
  const chunkSitemaps = Array.from({ length: totalChunks }).map((_, i) => ({
    url: `https://railthailand.com/stations-routes-sitemap/${i}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "https://railthailand.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://railthailand.com/stations",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://railthailand.com/trains",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://railthailand.com/cities",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://railthailand.com/blogs",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://www.railthailand.com/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.railthailand.com/terms-of-service",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    { url: "https://railthailand.com/stations/sitemap.xml", lastModified: new Date() },
    { url: "https://railthailand.com/trains/sitemap.xml", lastModified: new Date() },
    { url: "https://railthailand.com/cities/sitemap.xml", lastModified: new Date() },
    { url: "https://railthailand.com/blogs/sitemap.xml", lastModified: new Date() },
    ...chunkSitemaps,
  ];
}