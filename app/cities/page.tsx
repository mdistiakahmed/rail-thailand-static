// app/cities/page.tsx
import Image from "next/image";
import Link from "next/link";
import { FaTrain, FaExchangeAlt, FaClock, FaRoute } from "react-icons/fa";

import { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "Thailand Train Schedule & Intercity Railway Timetable | RailThailand";

  const description =
    "Browse complete Thailand train schedules and intercity railway timetables. Compare departure times, travel duration, and routes including Bangkok to Chiang Mai, Pattaya, Ayutthaya, Hua Hin and more. Plan your Thailand railway journey with updated SRT schedules.";

  return {
    title,
    description,
    keywords: [
      "Thailand train schedule",
      "Thailand railway timetable",
      "Bangkok to Chiang Mai train",
      "Thailand intercity train",
      "SRT train schedule",
      "Thailand railway routes",
      "Thailand train times",
    ],
    alternates: {
      canonical: "https://railthailand.com/cities",
    },
    openGraph: {
      title,
      description,
      url: "https://railthailand.com/cities",
      type: "website",
      siteName: "RailThailand",
      images: "/thai-train.jpg",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: "/thai-train.jpg",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}


// Base route data (only define once)
const BASE_ROUTES = [
  {
    from: "Bangkok",
    to: "Chiang Mai",
    slug: "bangkok-to-chiang-mai",
    trainCount: 12,
    duration: "10-12 hours",
  },
  {
    from: "Bangkok",
    to: "Pattaya",
    slug: "bangkok-to-pattaya",
    trainCount: 8,
    duration: "2-3 hours",
  },
  {
    from: "Bangkok",
    to: "Phuket",
    slug: "bangkok-to-phuket",
    trainCount: 5,
    duration: "12-14 hours",
  },
  {
    from: "Bangkok",
    to: "Ratchaburi",
    slug: "bangkok-to-ratchaburi",
    trainCount: 5,
    duration: "2-3 hours",
  },
  {
    from: "Bangkok",
    to: "Ayutthaya",
    slug: "bangkok-to-ayutthaya",
    trainCount: 16,
    duration: "2-3 hours",
  },
  {
    from: "Bangkok",
    to: "Hua Hin",
    slug: "bangkok-to-hua-hin",
    trainCount: 16,
    duration: "2-3 hours",
  },
  {
    from: "Bangkok",
    to: "Nakhon Pathom",
    slug: "bangkok-to-nakhon-pathom",
    trainCount: 16,
    duration: "2-3 hours",
  },
];
// Automatically generate reverse routes
const CITY_ROUTES = BASE_ROUTES.flatMap((route) => {
  const reverseSlug = `${route.to
    .toLowerCase()
    .replace(/\s+/g, "-")}-to-${route.from
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return [
    route,
    {
      ...route,
      from: route.to,
      to: route.from,
      slug: reverseSlug,
    },
  ];
});

export default function CitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* HERO SECTION */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Thailand Train Schedule & Intercity Railway Timetable
          </h1>

          <p className="text-gray-700 max-w-4xl mx-auto text-lg leading-relaxed">
            Browse complete Thailand train schedules for major intercity railway routes
            operated by the State Railway of Thailand (SRT). Compare departure
            times, estimated travel duration, train frequency, and station stops
            for popular routes including Bangkok to Chiang Mai, Bangkok to
            Pattaya, Bangkok to Ayutthaya, Hua Hin, Surat Thani and southern
            Thailand railway connections.
          </p>

          <p className="text-gray-600 max-w-3xl mx-auto text-base mt-4">
            Use our updated Thailand railway timetable to plan overnight trains,
            express services, rapid trains, and local intercity journeys across
            the Northern, Northeastern, Eastern and Southern railway lines.
          </p>
        </section>

        {/* HERO IMAGE */}
        <div className="flex justify-center mb-16">
          <Image
            src="/thai-train.jpg"
            alt="Thailand Railway train on intercity route operated by State Railway of Thailand"
            width={1000}
            height={450}
            className="rounded-3xl object-cover"
            priority
          />
        </div>

        {/* ROUTE GRID SECTION */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Thailand Train Routes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {CITY_ROUTES.map((route, index) => (
              <Link
                key={index}
                href={`/cities/${route.slug}`}
                prefetch={false}
                className="group"
              >
                <article className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

                  <div className="flex items-center space-x-4 mb-5">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <FaRoute className="text-blue-600 text-xl" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                      {route.from}
                      <FaExchangeAlt className="inline mx-2 text-gray-400" />
                      {route.to}
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-blue-500" />
                      <span>Estimated Duration: {route.duration}</span>
                    </div>

                    <p className="text-gray-500 leading-relaxed">
                      View full train timetable including departure times,
                      arrival schedule, station stops and train frequency.
                    </p>
                  </div>

                  <div className="mt-6 text-blue-600 font-semibold group-hover:underline">
                    View Full Train Schedule →
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO AUTHORITY SECTION */}
        <section className="mt-20 bg-blue-50 rounded-3xl p-10 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Complete Thailand Railway Timetable Guide
          </h2>

          <p className="text-gray-700 leading-relaxed mb-5">
            Our Thailand train schedule pages provide detailed and structured
            railway timetable information for intercity trains operated by SRT.
            Each route includes departure times, arrival times, journey duration,
            train types (Express, Rapid, Special Express, Local), and key station
            stops along the railway corridor.
          </p>

          <p className="text-gray-700 leading-relaxed mb-5">
            Whether you are traveling from Bangkok to northern Thailand,
            heading south to Surat Thani for island transfers, commuting to
            Pattaya, or planning an overnight sleeper train to Chiang Mai,
            comparing Thailand railway schedules helps you select the most
            convenient departure.
          </p>

          <p className="text-gray-700 leading-relaxed">
            All timetable information is organized for easy comparison,
            allowing travelers to quickly evaluate travel duration, departure
            frequency, and arrival times between major Thai cities.
          </p>
        </section>

        {/* TRAVEL TIPS SECTION (SEO BOOSTER) */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thailand Train Travel Tips
          </h2>

          <div className="grid md:grid-cols-2 gap-8 text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold mb-2">Best Time to Travel</h3>
              <p>
                Morning departures offer convenient same-day arrival,
                while overnight sleeper trains are popular for long-distance
                routes such as Bangkok to Chiang Mai.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Types of Thailand Trains</h3>
              <p>
                Thailand operates Special Express, Express, Rapid and Local
                services. Travel time varies depending on train type and
                number of stops.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Major Railway Lines</h3>
              <p>
                Thailand&apos;s railway network includes the Northern Line,
                Northeastern Line, Eastern Line, and Southern Line connecting
                major cities across the country.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Plan Your Journey Efficiently</h3>
              <p>
                Comparing train departure times and journey duration in advance
                ensures smoother transfers and better travel planning across
                Thailand&apos;s intercity railway system.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
