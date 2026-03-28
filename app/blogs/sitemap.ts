import { MetadataRoute } from "next";
import { getAllBlogs } from "@/sanity/lib/sanity";

export const dynamic = "force-static";
const BASE_URL = "https://railthailand.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getAllBlogs();

  return blogs.map((blog: any) => ({
    url: `${BASE_URL}/blogs/${blog.slug}`,
    lastModified: blog.publishedAt ? new Date(blog.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
}