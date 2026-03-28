import Link from "next/link";
import fs from "fs";
import path from "path";
import { FaTrain, FaExternalLinkAlt, FaQuestionCircle, FaRegCommentDots } from "react-icons/fa";

export function generateAllRoutesSection(from: string, to: string, currentSlug: string) {
  // Get all city schedule files
  const schedulesDir = path.join(process.cwd(), "data", "city-schedules");
  try {
    const files = fs.readdirSync(schedulesDir);
    const allRoutes = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""))
      .filter((slug) => {
        const [routeFrom, routeTo] = slug.split("-to-");
        // Check if this route involves either from or to city (partial match)
        return routeFrom.toLowerCase().includes(from.toLowerCase()) || 
               routeTo.toLowerCase().includes(to.toLowerCase()) ||
               from.toLowerCase().includes(routeFrom.toLowerCase()) || 
               to.toLowerCase().includes(routeTo.toLowerCase());
      })
      .sort((a, b) => {
        const [aFrom, aTo] = a.split("-to-");
        const [bFrom, bTo] = b.split("-to-");
        return aFrom.localeCompare(bFrom) || aTo.localeCompare(bTo);
      });

    // Remove current route and add reverse route at the beginning
    const currentRouteIndex = allRoutes.findIndex(route => route === currentSlug);
    const reverseRoute = `${to.toLowerCase().replace(/\s+/g, "-")}-to-${from.toLowerCase().replace(/\s+/g, "-")}`;
    
    const filteredRoutes = allRoutes.filter(route => route !== currentSlug);
    const sortedRoutes = [reverseRoute, ...filteredRoutes];

    if (sortedRoutes.length === 0) return null;

    return (
      <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Related Train Routes from {from} & {to}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRoutes.map((routeSlug, index) => {
            const [routeFrom, routeTo] = routeSlug.split("-to-");
            const isCurrentRoute = routeSlug === currentSlug;
            
            return (
              <Link
                key={index}
                href={`/cities/${routeSlug}`}
                prefetch={false}
                className={`
                  block p-4 rounded-lg border transition-all duration-200
                  ${isCurrentRoute 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-lg">
                    {routeFrom.split("-").map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(" ")} to{" "}
                    {routeTo.split("-").map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(" ")} train schedule, timetable & SRT train times
                  </span>
                  {isCurrentRoute && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Current Route
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">
                  View train schedules, departure times, and booking options
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error reading routes:", error);
    return null;
  }
}

export function generateRouteStructuredData(
  from: string,
  to: string,
  trips: any[]
) {
  const baseUrl = "https://www.railthailand.com";

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${from} to ${to} Train Schedule & Timetable`,
    description: `Check the latest ${from} to ${to} train schedule, departure times, arrival times, and operating days. Compare all available train services in Thailand.`,
    url: `${baseUrl}/cities/${from.toLowerCase()}-to-${to.toLowerCase()}`,

    about: {
      "@type": "Route",
      name: `${from} to ${to} Railway Route`,
      departureStation: {
        "@type": "TrainStation",
        name: `${from} Railway Station`
      },
      arrivalStation: {
        "@type": "TrainStation",
        name: `${to} Railway Station`
      }
    },

    mainEntity: {
      "@type": "ItemList",
      name: `${from} to ${to} Train Services`,
      numberOfItems: trips.length,
      itemListElement: trips.map((trip: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TrainTrip",
          name: `${trip.train_type} Train #${trip.train_no}`,
          departureStation: {
            "@type": "TrainStation",
            name: trip.from_station || from
          },
          arrivalStation: {
            "@type": "TrainStation",
            name: trip.to_station || to
          },
          departureTime: trip.depart_time,
          arrivalTime: trip.arrive_time
        }
      }))
    }
  };
}


export function generateRouteFAQ(
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

  const firstTrain = sorted[0];
  const lastTrain = sorted[sorted.length - 1];

  const trainTypes = Array.from(
    new Set(trips.map((t) => t.train_type))
  ).join(", ");

  const approxDuration = (() => {
    const sample = sorted[0];
    if (!sample?.depart_time || !sample?.arrive_time) return null;

    const [depH, depM] = sample.depart_time.split(":").map(Number);
    const [arrH, arrM] = sample.arrive_time.split(":").map(Number);
    let totalMinutes = arrH * 60 + arrM - (depH * 60 + depM);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const hours = Math.floor(totalMinutes / 60);
    return `${hours} hours`;
  })();

  const faqData = [
    {
      question: `How many trains run from ${from} to ${to}?`,
      answer: `There are ${trips.length} trains operating daily between ${from} and ${to}. These services run throughout the day and are operated by the State Railway of Thailand (SRT).`,
    },
    {
      question: `What is the first train from ${from} to ${to}?`,
      answer: `The first train from ${from} to ${to} departs at ${formatTime(firstTrain.depart_time)}.`,
    },
    {
      question: `What is the last train from ${from} to ${to}?`,
      answer: `The last scheduled train from ${from} to ${to} leaves at ${formatTime(lastTrain.depart_time)}.`,
    },
    {
      question: `How long is the train journey from ${from} to ${to}?`,
      answer: approxDuration
        ? `The average train journey from ${from} to ${to} takes approximately ${approxDuration}, depending on the type of service and number of stops.`
        : `The journey duration varies depending on the train type and schedule.`,
    },
    {
      question: `What types of trains operate between ${from} and ${to}?`,
      answer: `Train services on this route include ${trainTypes}. Different classes and seating options may be available depending on the train.`,
    },
    {
      question: `Do trains from ${from} to ${to} run daily?`,
      answer: `Most trains on the ${from} to ${to} route operate daily, although some services may have specific operating days. Check the detailed timetable above for exact schedules.`,
    },
  ];

  return (
    <div className="mt-12 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10r">
        Frequently Asked Questions - {from} to {to} Trains
      </h2>

      <div className="space-y-8">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 md:p-8"
          >
            {/* Question */}
            <div className="flex items-start gap-3 mb-3">
              <FaQuestionCircle className="text-indigo-600 mt-1 shrink-0 text-lg" />
              <h3 className="text-lg font-semibold text-gray-800">
                {faq.question}
              </h3>
            </div>

            {/* Answer */}
            <div className="flex items-start gap-3">
              <FaRegCommentDots className="text-gray-500 mt-1 shrink-0 text-lg" />
              <p className="text-gray-700 leading-7">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}