import Link from "next/link";
import Image from "next/image";
import { getAllBlogs } from '@/sanity/lib/sanity';

export const dynamic = "force-static";
export const revalidate = false;

async function getRecentBlogs() {
  const blogs = await getAllBlogs()
  return blogs.slice(0, 6) // Get only 6 most recent blogs
}

export default async function Home() {
  const recentBlogs = await getRecentBlogs()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Explore Thailand</span>
                  <span className="block text-red-600">By Train</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover the beauty of Thailand with our comprehensive train
                  travel guide. Find schedules, book tickets, and plan your
                  perfect rail journey across the Kingdom.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="https://dticket.railway.co.th/DTicketPublicWeb/home/Home"
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
                    >
                      Book Tickets
                    </Link>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link
                      href="/trains"
                      prefetch={false}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      View All Trains
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="flex justify-center bg-gray-100">
          <Image
            className="w-full max-w-4xl max-h-[500px] object-cover"
            src="/thai-train.jpg"
            alt="Thailand train journey"
            width={1600}
            height={900}
            priority
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">
              Services
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for train travel in Thailand
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              From schedules to tickets, we've got you covered for your Thai
              rail adventure.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Train Schedule */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Train Schedules
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Find up-to-date train schedules for all major routes
                      across Thailand. Check departure and arrival times,
                      journey durations, and service availability.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/trains"
                        prefetch={false}
                        className="text-base font-medium text-red-600 hover:text-red-500"
                      >
                        View All Trains<span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Routes by Station */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Routes by Station
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Plan your journey with our station-to-station route
                      planner. Find all available connections and plan multi-leg
                      trips across Thailand's rail network.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/stations"
                        prefetch={false}
                        className="text-base font-medium text-red-600 hover:text-red-500"
                      >
                        Explore Routes<span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular City Routes */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      City Connections
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Discover popular routes between major Thai cities. Compare
                      travel times, prices, and train types for your next
                      intercity journey.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/cities"
                        prefetch={false}
                        className="text-base font-medium text-red-600 hover:text-red-500"
                      >
                        View City Routes<span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Tracking CTA */}
      <div className="bg-red-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Real-time Train Tracking</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-red-100">
            Track your train in real-time and get live updates on its location
            and estimated arrival times.
          </p>
          <Link
            href="https://ttsview.railway.co.th/v3/"
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-red-50 sm:w-auto"
          >
            Track Now
          </Link>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">
              Popular Routes
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Explore Thailand's Most Scenic Journeys
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Discover the most popular train routes in Thailand
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {[
              {
                name: "Bangkok to Chiang Mai",
                description:
                  "Experience the scenic journey from Thailand's bustling capital to the cultural heart of the north.",
                href: "/cities/bangkok-to-chiang-mai",
                distance: "750 km",
                duration: "10-12 hours",
              },
              {
                name: "Bangkok to Ayutthaya",
                description:
                  "A short journey to the ancient capital, home to UNESCO World Heritage temples and ruins.",
                href: "/cities/bangkok-to-ayutthaya",
                distance: "80 km",
                duration: "1.5-2 hours",
              },
              {
                name: "Bangkok to Phuket",
                description:
                  "Gateway to the southern islands, with connections to Koh Samui, Phangan, and more.",
                href: "/cities/bangkok-to-phuket",
                distance: "650 km",
                duration: "8-10 hours",
              },
            ].map((route) => (
              <div
                key={route.name}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">
                      {route.distance} • {route.duration}
                    </p>
                    <Link href={route.href} prefetch={false} className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">
                        {route.name}
                      </p>
                      <p className="mt-3 text-base text-gray-500">
                        {route.description}
                      </p>
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">View route</span>
                      <svg
                        className="h-5 w-5 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <Link
                        href={route.href}
                        prefetch={false}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        View schedule
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to explore Thailand by train?</span>
            <span className="block text-red-600">
              Start planning your journey today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="https://dticket.railway.co.th/DTicketPublicWeb/home/Home"
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Book Your Tickets
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/trains"
                prefetch={false}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50"
              >
                View All Trains
              </Link>
            </div>
          </div>
        </div>
      </div>

            {/* Blog Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">
              Latest Blogs
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Train Travel Tips & Stories
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Discover helpful guides, travel stories, and insider tips for exploring Thailand by train.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recentBlogs.map((blog: any) => (
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
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="mt-3 text-base text-gray-500 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}
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

          <div className="mt-12 text-center">
            <Link
              href="/blogs"
              prefetch={false}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              View All Blogs
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
