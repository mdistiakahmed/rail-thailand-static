// Create new file: app/routes/[station]/page.tsx
import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrain, FaExternalLinkAlt } from 'react-icons/fa';
import { RouteSearch } from './components';
import type { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'trains-by-stations', 'all-trips.json');
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Extract unique station names from routes
    const stationNames = new Set<string>();
    
    data.routes.forEach((route: any) => {
      const fromStation = route.route.split(' - ')[0];
      // Convert station name to URL-friendly format
      const slug = fromStation
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[()]/g, '')
        .replace(/[^a-z0-9-]/g, '');
      stationNames.add(slug);
    });
    
    // Convert Set back to array and return as params
    return Array.from(stationNames).map(name => ({
      name: name
    }));
  } catch (error) {
    console.error('Error generating static params for stations:', error);
    return [];
  }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { name } = await params;

  const decoded = decodeURIComponent(name);
  const stationName = decoded
    .split(/[-%20]/)
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Load routes to make metadata content-aware
  const jsonPath = path.join(
    process.cwd(),
    "data",
    "trains-by-stations",
    "all-trips.json"
  );
  const fileContents = await fs.readFile(jsonPath, "utf8");
  const data = JSON.parse(fileContents);

  const stationRoutes = data.routes.filter((route: Route) =>
    route.route.startsWith(`${stationName} - `)
  );

  const totalRoutes = stationRoutes.length;

  // Extract a few destination names for uniqueness
  const sampleDestinations = stationRoutes
    .slice(0, 3)
    .map((r: Route) => r.route.split(" - ")[1])
    .join(", ");

  const title = `Train Routes from ${stationName} (${totalRoutes} Destinations) | Rail Thailand`;

  const description = totalRoutes > 0
    ? `Explore ${totalRoutes} train routes departing from ${stationName} Railway Station, including connections to ${sampleDestinations}. View schedules, destinations, and plan your Thailand railway journey easily.`
    : `Discover train routes departing from ${stationName} Railway Station in Thailand. Check destinations, schedules, and travel information for your railway journey.`;

  return {
    title,
    description,
    keywords: [
      `${stationName} train routes`,
      `Trains from ${stationName}`,
      `${stationName} railway station`,
      `Thailand train schedule from ${stationName}`,
      `${stationName} to Bangkok train`,
      `State Railway of Thailand ${stationName}`,
    ],
    alternates: {
      canonical: `https://www.railthailand.com/stations/${name}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.railthailand.com/stations/${name}`,
      siteName: "Rail Thailand",
      type: "website",
      images: [
        {
          url: "https://www.railthailand.com/thai-train.jpg",
          width: 1200,
          height: 630,
          alt: `Train routes from ${stationName}`,
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

interface Route {
  route: string;
  filename: string;
}

async function getRoutesForStation(station: string): Promise<Route[]> {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'trains-by-stations', 'all-trips.json');
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Filter routes that start with the given station
    const stationRoutes = data.routes.filter((route: Route) => 
      route.route.startsWith(`${station} - `)
    );
    
    return stationRoutes;
  } catch (error) {
    console.error('Error loading routes:', error);
    return [];
  }
}

function formatStationName(slug: string): string {
  // First decode the URL-encoded string
  const decoded = decodeURIComponent(slug);

  // Handle special cases for Bangkok stations
  const specialBangkokCases: any = {
    'bangkok-hua-lamphong': 'Bangkok (Hua Lamphong)',
    'bangkok-krung-thep-aphiwat': 'Bangkok (Krung Thep Aphiwat)',
    'bangkok-thon-buri': 'Bangkok (Thon Buri)'
  };
  
  // Check if this is a special Bangkok station
  if (specialBangkokCases[decoded]) {
    return specialBangkokCases[decoded];
  }
  
  // Then format it properly
  return decoded
    .split(/[-%20]/) // Handle both hyphens and %20 spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function RoutesPage({ params }: any) {
  const {name } = await params
  const stationName = formatStationName(name);
  const routes = await getRoutesForStation(stationName);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          {routes.length > 0 ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 break-words">
                {stationName} Train Schedule & Routes to {routes
                  .slice(0, 2)
                  .map((r) => r.route.split(" - ")[1])
                  .join(" , ")} and more destinations ({routes.length} Total Destinations)
              </h1>

              <p className="text-gray-700 mb-3">
                Check the complete station wise train schedule from {stationName} Railway Station,
                including {routes
                  .slice(0, 3)
                  .map((r) => r.route.split(" - ")[1])
                  .join(", ")} and other major Thailand railway destinations.
                This page lists all available train routes, departure connections,
                and updated Thailand railway timetable information.
              </p>

              <p className="text-gray-600 text-sm sm:text-base">
                {routes.length} train routes currently operate from {stationName},
                helping travelers compare destinations, review schedules,
                and plan their Thailand railway journey efficiently.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 break-words">
                {stationName} Railway Station Train Routes & Schedule
              </h1>

              <p className="text-gray-700">
                Explore available train routes and timetable information from
                {stationName} Railway Station in Thailand. Check back for updated
                station wise schedule details and new railway connections.
              </p>
            </>
          )}
        </div>

        <Image
          src="/thai-train.jpg"
          alt="Thailand Railway Train Journey"
          width={600}
          height={300}
          className="mx-auto my-8"
        />

        <RouteSearch 
          startStation={stationName}
          routes={routes}
        />

        <div className="space-y-4">
          {routes.length > 0 ? (
            routes.map((route, index) => {
              const [from, to] = route.route.split(' - ');
              return (
                <Link
                  key={index}
                  href={`/stations/${name}/${route.filename.replace('.json', '')}`}
                  prefetch={false}
                  className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {from} to <span className="text-blue-600">{to}</span> Train Schedule
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        View train timetable, departure times, and route details from {from} Railway Station to {to}, Thailand.
                      </p>
                    </div>

                    <div className="text-blue-500">
                      <FaExternalLinkAlt className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No routes found from this station.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}