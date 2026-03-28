// lib/sanity.ts
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to true for production
})

// Fetch all blogs with limited fields
export async function getAllBlogs() {
  const query = `*[_type == "blog"] | order(lessonNumber desc) {
    _id,
    title,
    excerpt,
    "slug": slug.current,
    "category": category->title,
    "coverImage": coverImage {
      asset->{
        _id,
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    lessonNumber,
    publishedAt
  }`
  
  return await client.fetch(query)
}