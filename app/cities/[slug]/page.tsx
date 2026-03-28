// app/cities/[slug]/page.tsx
import { notFound } from "next/navigation";
import { FaTrain, FaExternalLinkAlt, FaQuestionCircle, FaRegCommentDots } from "react-icons/fa";
import Link from "next/link";
import fs from "fs";
import path from "path";
import Image from "next/image";
import { Metadata } from 'next';
import { generateAllRoutesSection, generateRouteFAQ, generateRouteStructuredData } from "./component";

export const dynamic = "force-static";
export const revalidate = false;
// Add this function before the CityRoutePage component
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params;
  const [fromCity, toCity] = slug.split("-to-");

  if (!fromCity || !toCity) {
    return {
      title: "City Route Not Found | RailThailand",
      robots: { index: false, follow: false },
    };
  }

  const formatCityName = (str: string) =>
    str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const from = formatCityName(fromCity);
  const to = formatCityName(toCity);

  const routeTitle = `${from} to ${to} Train Schedule 2026 | Timetable, Train Times & SRT Info`;
  const routeDescription = `Looking for ${from} to ${to} train times? See updated departure, arrival, duration & SRT train details. Compare express, rapid & ordinary trains on Thailand Railway.`;

  return {
    title: routeTitle,
    description: routeDescription,

    keywords: [
      `${from} to ${to} train schedule`,
      `${from} to ${to} train time`,
      `${from} to ${to} timetable`,
      `Thailand Railway ${from} to ${to}`,
      `SRT ${from} ${to} train`,
    ],


    openGraph: {
      title: routeTitle,
      description: routeDescription,
      url: `https://railthailand.com/cities/${slug}`,
      images: "/thai-train.jpg",
      siteName: "RailThailand",
      type: "website",
      locale: "en_TH",
    },

    twitter: {
      card: "summary_large_image",
      title: routeTitle,
      description: routeDescription,
      images: "/thai-train.jpg",
    },

    alternates: {
      canonical: `https://railthailand.com/cities/${slug}`,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}


// Helper function to format time
function formatTime(timeString: string): string {
  if (!timeString || timeString === "N/A") return "--:--";
  const [hours, minutes] = timeString.split(":");
  return `${hours.padStart(2, "0")}:${minutes || "00"}`;
}

// Helper function to format operating days
function formatOperatingDays(days: string[] | undefined): string {
  if (!days || !Array.isArray(days) || days.length === 0) return "Daily";
  if (days.length === 7) return "Daily";
  return days.join(", ");
}

// Function to read and parse JSON file
async function readJsonFile(filePath: string) {
  try {
    const fileContents = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Function to get route data
async function getRouteData(slug: string) {
  try {
    const [fromCity, toCity] = slug.split("-to-");
    if (!fromCity || !toCity) throw new Error("Invalid route format");

    const forwardPath = path.join(
      process.cwd(),
      "data",
      "city-schedules",
      `${slug}.json`
    );

    const forwardData = await readJsonFile(forwardPath);

    return {
      fromCity: fromCity
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      toCity: toCity
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      forward: forwardData?.schedules || [],
    };
  } catch (error) {
    console.error("Error getting route data:", error);
    return null;
  }
}




function generateScheduleParagraph(
  trips: any[],
  from: string,
  to: string
) {
  if (!trips || trips.length === 0) return null;

  const formatTime = (timeString: string): string => {
    if (!timeString || timeString === "N/A") return "--:--";
    const [hours, minutes] = timeString.split(":");
    return `${hours.padStart(2, "0")}:${minutes || "00"}`;
  };

  const sorted = [...trips].sort(
    (a, b) =>
      (a.depart_time || "").localeCompare(b.depart_time || "")
  );

  const sampleTrains = sorted.slice(0, 2);

  const examples = sampleTrains
    .map(
      (trip) =>
        `Train ${trip.train_no} (${trip.train_type}) departs at ${formatTime(
          trip.depart_time
        )} and arrives at ${formatTime(trip.arrive_time)}`
    )
    .join(", while ");

  return (
    <p className="my-6 text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
      The {from} to {to} train schedule includes {trips.length} daily
      services operated by the State Railway of Thailand (SRT). This timetable
      covers express, rapid, and ordinary trains connecting {from} station
      and {to} station throughout the day. For example, {examples},
      providing passengers with flexible travel options and reliable
      arrival times across the Thailand Railway network.
    </p>
  );
}


export default async function CityRoutePage({ params }: any) {
  const { slug } = await params;
  const routeData = await getRouteData(slug);

  if (!routeData) {
    notFound();
  }

  const { fromCity, toCity, forward } = routeData;
  const firstDeparture = formatTime(forward[0].depart_time);
  const lastDeparture = formatTime(forward[forward.length - 1].depart_time);
  const structuredData = generateRouteStructuredData(
  fromCity,
  toCity,
  forward
);


  const headerSection = () => {
    return (
      <div className="text-center mb-10 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {fromCity} to {toCity} Train Schedule & Timetable
        </h1>

        <p className="text-lg mb-4 text-gray-700">
          The <strong>{fromCity} to {toCity} train schedule</strong> includes {forward.length} daily train services with departure times starting from {firstDeparture} and running until {lastDeparture}. This updated timetable shows arrival times, train numbers, journey duration, and service types for all trains operating on this route.
        </p>

        <p className="text-base mb-4 text-gray-600">
          Whether you are checking the latest {fromCity} to {toCity} train time or comparing express, rapid, and ordinary SRT trains, this Thailand Railway schedule helps you plan your trip efficiently between {fromCity} station and {toCity} station.
        </p>
      </div>
    );
  };


  return (
    <div className="min-h-screen w-screen md:w-full py-8 md:px-4 ">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }
      }
    />
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-auto">
        {headerSection()}

        <Image
          src="/thai-train.jpg"
          alt="Thailand Railway Train Journey"
          width={400}
          height={200}
          className="mx-auto my-8"
        />

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900 text-center">
              {fromCity} to {toCity} Train Schedule - Departure & Arrival Times
            </h2>

            {forward.length > 0 &&
              generateScheduleParagraph(forward, fromCity, toCity)
            }
          </div>

          <div className="overflow-x-auto max-w-4xl mx-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    From Station
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Departure
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Destination Station
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Arrival
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Days
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Train
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Train #
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forward.map((trip: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.from_station}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatTime(trip.depart_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.to_station}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(trip.arrive_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatOperatingDays(trip.operating_days)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaTrain className="flex-shrink-0 h-5 w-5 text-indigo-600" />
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {trip.train_type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-center font-mono">
                      <Link
                        href={`/trains/${trip.train_no}`}
                        prefetch={false}
                        className="text-blue-600 underline inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>{`View Train ${trip.train_no} schedule and stops`}</span>
                        <FaExternalLinkAlt className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {forward.length > 0 &&
          generateRouteFAQ(
            forward,
            fromCity,
            toCity
          )}

          {generateAllRoutesSection(fromCity, toCity, slug)}

      </div>
    </div>
  );
}

// Generate static paths at build time
export async function generateStaticParams() {
  const schedulesDir = path.join(process.cwd(), "data", "city-schedules");
  try {
    const files = await fs.promises.readdir(schedulesDir);
    return files
      .filter((file) => file.endsWith(".json"))
      .map((file) => ({
        slug: file.replace(".json", ""),
      }));
  } catch (error) {
    console.error("Error reading city schedules directory:", error);
    return [];
  }
}
