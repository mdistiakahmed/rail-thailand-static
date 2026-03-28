import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { FaTrain, FaExternalLinkAlt } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { FaQuestionCircle, FaRegCommentDots } from "react-icons/fa";

export const dynamic = 'force-static'

function getAllStationRoutes() {
  const filePath = path.join(process.cwd(), 'data', 'trains-by-stations', 'all-trips.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  return data.routes.map((route: any) => {
    const [from, to] = route.route.split(' - ');
    const slug = route.filename.replace('.json', '');
    
    return {
      name: from.toLowerCase().replace(/\s+/g, '-'),
      slug: slug
    };
  });
}


export async function generateStaticParams() {
  // Generate actual station routes
  const routes = getAllStationRoutes()
  return routes.map((route: any) => ({ name: route.name, slug: route.slug }))
}

// Helper function to parse the slug into readable station names
function parseSlug(slug: string) {
  const parts = slug.split("-to-");
  if (parts.length !== 2) return null;

  const formatStationName = (str: string) =>
    str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return {
    from: formatStationName(parts[0]),
    to: formatStationName(parts[1]),
  };
}

// Function to get train count for a specific route
function getTrainCountForRoute(
  fromStation: string,
  toStation: string,
): number | null {
  try {
    const slug = `${fromStation.toLowerCase().replace(/\s+/g, "-")}-to-${toStation.toLowerCase().replace(/\s+/g, "-")}`;
    const filePath = path.join(
      process.cwd(),
      "data",
      "trains-by-stations",
      `${slug}.json`,
    );
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);
    return data.length;
  } catch (error) {
    return null;
  }
}

// Function to fetch route data
async function getRouteData(slug: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "trains-by-stations",
      `${slug}.json`,
    );
    const fileContents = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.log("error.......");
    return null;
  }
}

// Function to get reverse route data
async function getReverseRouteData(fromStation: string, toStation: string) {
  try {
    const reverseSlug = `${toStation.toLowerCase().replace(/\s+/g, "-")}-to-${fromStation.toLowerCase().replace(/\s+/g, "-")}`;
    const filePath = path.join(
      process.cwd(),
      "data",
      "trains-by-stations",
      `${reverseSlug}.json`,
    );
    const fileContents = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    return null;
  }
}

// Function to get popular destinations from a station
async function getPopularDestinations(stationName: string, limit: number = 8) {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "trains-by-stations",
      "all-trips.json",
    );
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);

    const destinations = data.routes
      .filter((route: any) => route.route.startsWith(`${stationName} - `))
      .map((route: any) => {
        const destination = route.route.split(" - ")[1];
        return {
          name: destination,
          slug: route.filename.replace(".json", ""),
        };
      })
      .slice(0, limit);

    return destinations;
  } catch (error) {
    return [];
  }
}

// Function to get popular blogs
async function getPopularBlogs(limit: number = 8) {
  try {
    const { getAllBlogs } = await import("@/sanity/lib/sanity");
    const blogs = await getAllBlogs();
    return blogs.slice(0, limit);
  } catch (error) {
    return [];
  }
}

import type { Metadata } from "next";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { name, slug } = await params;
  const stations = parseSlug(slug);
  if (!stations) {
    return { title: "Route Not Found | Rail Thailand" };
  }

  const data = await getRouteData(slug);
  if (!data || data.length === 0) {
    return {
      title: `${stations.from} to ${stations.to} Train Schedule | No Data Available`,
      robots: { index: false, follow: true },
    };
  }

  const sorted = [...data].sort((a, b) =>
    a.departure_from_current.localeCompare(b.departure_from_current),
  );

  const totalTrains = sorted.length;
  const firstTrain = sorted[0];
  const lastTrain = sorted[sorted.length - 1];

  // Calculate shortest & longest duration
  const durations = sorted.map((trip) =>
    getJourneyDuration(trip.departure_from_current, trip.arrival_at_to_station),
  );

  const title = `${stations.from} to ${stations.to} Train Schedule & Timetable (${totalTrains} Daily Trains) | Rail Thailand`;

  const description = `Check the latest ${stations.from} to ${stations.to} train schedule in Thailand. ${totalTrains} daily trains operate on this route. First departure at ${firstTrain.departure_from_current}, last train at ${lastTrain.departure_from_current}. View updated timetable, journey duration, train types, and operating days.`;

  const url = `https://www.railthailand.com/stations/${name}/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${stations.from} to ${stations.to} train schedule`,
      `${stations.from} to ${stations.to} timetable`,
      `${stations.from} to ${stations.to} train time`,
      `Thailand railway ${stations.from} to ${stations.to}`,
      `${stations.from} to ${stations.to} departure time`,
      `${stations.from} to ${stations.to} daily trains`,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Rail Thailand",
      type: "website",
      images: [
        {
          url: "https://www.railthailand.com/thai-train.jpg",
          width: 1200,
          height: 630,
          alt: `${stations.from} to ${stations.to} train schedule`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.railthailand.com/thai-train.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Helper function to get journey duration
const getJourneyDuration = (departure: string, arrival: string) => {
  if (!departure || !arrival || departure === "N/A" || arrival === "N/A") {
    return "Unknown duration";
  }

  try {
    // Parse times
    const [depHours, depMinutes] = departure.split(":").map(Number);
    const [arrHours, arrMinutes] = arrival.split(":").map(Number);

    // Convert to minutes since midnight
    const depTotalMinutes = depHours * 60 + depMinutes;
    let arrTotalMinutes = arrHours * 60 + arrMinutes;

    // Handle overnight trains (arrival before departure)
    if (arrTotalMinutes < depTotalMinutes) {
      arrTotalMinutes += 24 * 60; // Add 24 hours
    }

    // Calculate duration
    const durationMinutes = arrTotalMinutes - depTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minutes`;
    }
  } catch (error) {
    return "Unknown duration";
  }
};

// Format time to 12-hour format
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Format operating days
function formatOperatingDays(daysString: string): string {
  if (!daysString) return "N/A";
  const days = daysString.split(",").map((day) => day.trim());
  return days.length === 7 ? "All 7 days in the week" : daysString;
}

export default async function StationRoutePage({ params }: any) {
  const { slug } = await params;
  const stations = parseSlug(slug);
  if (!stations) notFound();

  const data = await getRouteData(slug);
  if (!data) notFound();

  // Sort data by departure time
  const sortedData = [...data].sort((a, b) =>
    a.departure_from_current.localeCompare(b.departure_from_current),
  );

  // Get related data
  const reverseRouteData = await getReverseRouteData(
    stations.from,
    stations.to,
  );
  const fromDestinations = await getPopularDestinations(stations.from, 20);
  const toDestinations = await getPopularDestinations(stations.to, 20);
  const popularBlogs = await getPopularBlogs(8);

  const toStationSlug = stations.to.toLowerCase().replace(/\s+/g, "-");
  const reverseSlug = `${toStationSlug}-to-${stations.from.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="min-h-screen w-screen md:w-full py-8 md:px-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-auto">
        {/* Header */}
        <div className="text-center mb-10 max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {stations.from} to {stations.to} Train Schedule, Timetable &
            Departure Times
          </h1>

          <p className="text-lg text-gray-700 mb-4">
            There {sortedData.length === 1 ? "is" : "are"}{" "}
            <strong>
              {sortedData.length} daily train{sortedData.length > 1 ? "s" : ""}
            </strong>{" "}
            operating from <strong>{stations.from}</strong> to{" "}
            <strong>{stations.to}</strong> via Thailand Railway. The first train
            departs at{" "}
            <strong>{formatTime(sortedData[0].departure_from_current)}</strong>{" "}
            and the last service leaves at{" "}
            <strong>
              {formatTime(
                sortedData[sortedData.length - 1].departure_from_current,
              )}
            </strong>
            .
          </p>

          <p className="text-base text-gray-600">
            On this page, you can check updated departure times, arrival times,
            journey duration, train numbers, operating days, and available train
            types for the {stations.from} - {stations.to} railway route. Compare
            services and plan your train journey in Thailand efficiently.
          </p>
        </div>

        <Image
          src="/thai-train.jpg"
          alt="Thailand Railway Train Journey"
          width={400}
          height={200}
          className="mx-auto my-8"
        />

        <div className="overflow-x-auto flex flex-col gap-8">
          {/* Schedule Table */}
          <div className="flex flex-col overflow-x-auto">
            <div>
              <div className="bg-red-600 text-white px-6 py-3">
                <h2 className="text-xl font-semibold">
                  {stations.from} to {stations.to} Schedule
                </h2>
              </div>
              <div className="w-full overflow-x-auto">
                {sortedData && sortedData.length > 0 ? (
                  <table className="min-w-max w-full bg-white rounded-lg shadow-sm border border-gray-100">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 border-b text-center text-xs sm:text-sm font-medium uppercase tracking-wider">
                          Departure
                        </th>
                        <th className="py-3 px-4 border-b text-center text-xs sm:text-sm font-medium uppercase tracking-wider">
                          Arrival
                        </th>
                        <th className="py-3 px-4 border-b text-center text-xs sm:text-sm font-medium uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="py-3 px-4 border-b text-center text-xs sm:text-sm font-medium uppercase tracking-wider">
                          Operating Days
                        </th>
                        <th className="py-3 px-4 border-b text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                          Train Type
                        </th>
                        <th className="py-3 px-4 border-b text-center text-xs sm:text-sm font-medium uppercase tracking-wider">
                          Train No.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedData.map((trip: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-center">
                            {formatTime(trip.departure_from_current)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-center">
                            {formatTime(trip.arrival_at_to_station)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-center">
                            {getJourneyDuration(
                              trip.departure_from_current,
                              trip.arrival_at_to_station,
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-center">
                            {formatOperatingDays(trip.operating_days)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center">
                              <FaTrain className="text-indigo-600 mr-2" />
                              {trip.train_type}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-center font-mono">
                            <Link
                              href={`/trains/${trip.train_code}`}
                              prefetch={false}
                              className="text-blue-600 underline inline-flex items-center space-x-1 transition-colors"
                            >
                              <span>{trip.train_code}</span>
                              <FaExternalLinkAlt className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No scheduled trains found for this route.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8 mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Schedule Overview
          </h2>
          <div className="space-y-4">
            {sortedData.map((trip: any, index: number) => (
              <p key={index} className="text-gray-700">
                The {trip.train_type} (Train #{trip.train_code}) departs from{" "}
                {stations.from} at {formatTime(trip.departure_from_current)} and
                arrives in {stations.to} at{" "}
                {formatTime(trip.arrival_at_to_station)}.
              </p>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-14 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Frequently Asked Questions About {stations.from} to {stations.to}{" "}
            Trains
          </h2>

          <div className="space-y-6 max-w-4xl mx-auto flex flex-col gap-4">
            {/* Total Trains Question */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <FaQuestionCircle className="text-indigo-600 mt-1 shrink-0 text-lg" />
                <h3 className="text-lg font-semibold text-gray-800">
                  How many trains run daily from {stations.from} to{" "}
                  {stations.to}?
                </h3>
              </div>
              <div className="flex items-start gap-3">
                <FaRegCommentDots className="text-gray-500 mt-1 shrink-0 text-lg" />
                <p className="text-gray-700 leading-7">
                  There are {sortedData.length} daily trains operating from{" "}
                  {stations.from} to {stations.to}. Departure times start at{" "}
                  {formatTime(sortedData[0].departure_from_current)}
                  and continue throughout the day until the last train at{" "}
                  {formatTime(
                    sortedData[sortedData.length - 1].departure_from_current,
                  )}
                  .
                </p>
              </div>
            </div>

            {/* Duration Question */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <FaQuestionCircle className="text-indigo-600 mt-1 shrink-0 text-lg" />
                <h3 className="text-lg font-semibold text-gray-800">
                  How long does train take from {stations.from} to {stations.to}
                  ?
                </h3>
              </div>
              <div className="flex items-start gap-3">
                <FaRegCommentDots className="text-gray-500 mt-1 shrink-0 text-lg" />
                <p className="text-gray-700 leading-7">
                  Journey duration varies depending on train type and number of
                  stops. The average travel time ranges between{" "}
                  {getJourneyDuration(
                    sortedData[0].departure_from_current,
                    sortedData[0].arrival_at_to_station,
                  )}{" "}
                  and{" "}
                  {getJourneyDuration(
                    sortedData[sortedData.length - 1].departure_from_current,
                    sortedData[sortedData.length - 1].arrival_at_to_station,
                  )}
                  .
                </p>
              </div>
            </div>

            {/* First Train Question */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <FaQuestionCircle className="text-indigo-600 mt-1 shrink-0 text-lg" />
                <h3 className="text-lg font-semibold text-gray-800">
                  What is the first train from {stations.from} to {stations.to}?
                </h3>
              </div>
              <div className="flex items-start gap-3">
                <FaRegCommentDots className="text-gray-500 mt-1 shrink-0 text-lg" />
                <p className="text-gray-700 leading-7">
                  The earliest train departs from {stations.from} at{" "}
                  {formatTime(sortedData[0].departure_from_current)}
                  and arrives in {stations.to} at{" "}
                  {formatTime(sortedData[0].arrival_at_to_station)}.
                </p>
              </div>
            </div>

            {/* Last Train Question */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <FaQuestionCircle className="text-indigo-600 mt-1 shrink-0 text-lg" />
                <h3 className="text-lg font-semibold text-gray-800">
                  What is the last train from {stations.from} to {stations.to}?
                </h3>
              </div>
              <div className="flex items-start gap-3">
                <FaRegCommentDots className="text-gray-500 mt-1 shrink-0 text-lg" />
                <p className="text-gray-700 leading-7">
                  The final daily departure leaves {stations.from} at{" "}
                  {formatTime(
                    sortedData[sortedData.length - 1].departure_from_current,
                  )}
                  and reaches {stations.to} at{" "}
                  {formatTime(
                    sortedData[sortedData.length - 1].arrival_at_to_station,
                  )}
                  .
                </p>
              </div>
            </div>

            {/* Operating Days Question */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <FaQuestionCircle className="text-indigo-600 mt-1 shrink-0 text-lg" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Do trains from {stations.from} to {stations.to} run every day?
                </h3>
              </div>
              <div className="flex items-start gap-3">
                <FaRegCommentDots className="text-gray-500 mt-1 shrink-0 text-lg" />
                <p className="text-gray-700 leading-7">
                  Most trains on this route operate daily, but some services may
                  run only on selected days. Please check the "Operating Days"
                  column in the timetable above for the most accurate and
                  updated schedule information.
                </p>
              </div>
            </div>

            {/* Train Type Question */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <FaQuestionCircle className="text-indigo-600 mt-1 shrink-0 text-lg" />
                <h3 className="text-lg font-semibold text-gray-800">
                  What types of trains operate between {stations.from} and{" "}
                  {stations.to}?
                </h3>
              </div>
              <div className="flex items-start gap-3">
                <FaRegCommentDots className="text-gray-500 mt-1 shrink-0 text-lg" />
                <p className="text-gray-700 leading-7">
                  Trains on this route may include rapid, express, and local
                  services, depending on availability. Each train type differs
                  in travel time, stop frequency, and onboard facilities.
                </p>
              </div>
            </div>

            {/* Dynamic Train-Specific FAQs */}
            {sortedData.slice(0, 2).map((trip: any, index: number) => (
              <div
                key={`train-faq-${index}`}
                className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100"
              >
                <div className="flex items-start gap-3 mb-3">
                  <FaQuestionCircle className="text-indigo-600 mt-1 shrink-0 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    What time does Train {trip.train_code} depart from{" "}
                    {stations.from}?
                  </h3>
                </div>
                <div className="flex items-start gap-3">
                  <FaRegCommentDots className="text-gray-500 mt-1 shrink-0 text-lg" />
                  <p className="text-gray-700 leading-7">
                    Train {trip.train_code} ({trip.train_type}) departs from{" "}
                    {stations.from} at {formatTime(trip.departure_from_current)}
                    and arrives in {stations.to} at{" "}
                    {formatTime(trip.arrival_at_to_station)}.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= Return Journey ================= */}
        {reverseRouteData && (
          <section className="mt-16 max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <FaTrain className="text-blue-600 text-xl mt-1 shrink-0" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Return Train: {stations.to} → {stations.from}
                </h2>
              </div>

              <p className="text-gray-700 leading-relaxed mb-5">
                Planning your return trip? You can also check the complete train
                timetable for the journey from <strong>{stations.to}</strong>{" "}
                back to <strong>{stations.from}</strong>. View updated departure
                times, arrival schedules, train numbers and operating days for
                this return route in Thailand.
              </p>

              <Link
                href={`/stations/${toStationSlug}/${reverseSlug}`}
                prefetch={false}
                className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                View {stations.to} to {stations.from} Train Schedule
                <FaExternalLinkAlt className="text-sm" />
              </Link>
            </div>
          </section>
        )}

        {/* ================= Popular Routes From Station A ================= */}
        {fromDestinations.length > 0 && (
          <section className="mt-16 max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Popular Train Routes from {stations.from}
              </h2>
              <p className="text-gray-600 mt-2">
                Explore frequently searched train schedules departing from{" "}
                <strong>{stations.from}</strong>. These railway routes connect
                major destinations across Thailand.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fromDestinations.map((destination: any, index: number) => {
                const trainCount = getTrainCountForRoute(
                  stations.from,
                  destination.name,
                );

                return (
                  <Link
                    key={`from-${index}`}
                    href={`/stations/${stations.from.toLowerCase().replace(/\s+/g, "-")}/${destination.slug}`}
                    prefetch={false}
                    className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-3 mb-3">
                      <div className="flex gap-3 items-center justify-center">
                        <FaTrain className="text-red-500 text-base" />
                        <span className="text-base font-semibold text-gray-900">
                          {stations.from} → {destination.name}
                        </span>
                      </div>
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        {trainCount
                          ? `${trainCount} daily train${trainCount > 1 ? "s" : ""} available`
                          : "Train schedules available"}
                      </span>
                    </div>

                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                        View Complete Train Schedule
                      </p>
                      <p className="text-xs text-gray-500">
                        {trainCount} daily departures • Updated timetable
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= Popular Routes From Station B ================= */}
        {toDestinations.length > 0 && (
          <section className="mt-16 max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Popular Train Routes from {stations.to}
              </h2>
              <p className="text-gray-600 mt-2">
                Discover additional train connections departing from{" "}
                <strong>{stations.to}</strong>. Browse popular railway
                destinations and plan your next journey across Thailand.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {toDestinations.map((destination: any, index: number) => {
                const trainCount = getTrainCountForRoute(
                  stations.to,
                  destination.name,
                );

                return (
                  <Link
                    key={`from-${index}`}
                    href={`/stations/${stations.to.toLowerCase().replace(/\s+/g, "-")}/${destination.slug}`}
                    prefetch={false}
                    className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-3 mb-3">
                      <div className="flex gap-3 items-center justify-center">
                        <FaTrain className="text-red-500 text-base" />
                        <span className="text-base font-semibold text-gray-900">
                          {stations.to} → {destination.name}
                        </span>
                      </div>
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        {trainCount
                          ? `${trainCount} daily train${trainCount > 1 ? "s" : ""} available`
                          : "Train schedules available"}
                      </span>
                    </div>

                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                        View Complete Train Schedule
                      </p>
                      <p className="text-xs text-gray-500">
                        {trainCount} daily departures • Updated timetable
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= Popular Travel Blogs ================= */}
        {popularBlogs.length > 0 && (
          <section className="mt-16 max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Thailand Train Travel Guides
              </h2>
              <p className="text-gray-600 mt-2">
                Read popular travel blogs and guides about exploring Thailand by
                train, including railway journeys, station guides, and travel
                tips for visiting cities across the country.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularBlogs.map((blog: any, index: number) => (
                <Link
                  key={`blog-${index}`}
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
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {blog.category || "General"}
                      </span>
                      {blog.lessonNumber && (
                        <span className="text-sm text-gray-500">
                          Lesson #{blog.lessonNumber}
                        </span>
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
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}