// app/blogs/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'
import { getAllBlogs } from '@/sanity/lib/sanity'
import Image from 'next/image'

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Blogs | RailThailand',
  description: 'Explore our collection of informative blogs about train travel in Thailand',
}

export default async function BlogsPage() {
  const blogs = await getAllBlogs()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Train Travel Blogs</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog: any) => (
          <Link 
            key={blog._id} 
            href={`/blogs/${blog.slug}`}
            prefetch={false}
            className="group block overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {blog.coverImage && (
                <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={blog.coverImage.asset.url}
                    alt={blog.coverImage.alt || blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {blog.category || 'General'}
                </span>
                {blog.lessonNumber && (
                  <span className="text-sm text-gray-500">Lesson #{blog.lessonNumber}</span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {blog.title}
              </h2>
              {blog.publishedAt && (
                <p className="mt-2 text-sm text-gray-500">
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}