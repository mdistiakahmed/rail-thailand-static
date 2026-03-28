// app/routes/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { SearchStationButton } from './components';
import type { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Thailand Train Stations | View Routes by Departure Station";
  const description =
    "Browse all major train stations in Thailand and explore available railway routes from each departure station. Find train connections, travel routes, and plan your Thailand railway journey easily.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://www.railthailand.com/stations",
    },
    openGraph: {
      title,
      description,
      url: "https://www.railthailand.com/stations",
      siteName: "Rail Thailand",
      type: "website",
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

interface Route {
  route: string;
  filename: string;
}

interface GroupedRoutes {
  [key: string]: Route[];
}

async function getRoutes(): Promise<Route[]> {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'trains-by-stations', 'all-trips.json');
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.routes || [];
  } catch (error) {
    console.error('Error loading routes:', error);
    return [];
  }
}

function groupRoutesByStartStation(routes: Route[]): GroupedRoutes {
  const grouped = routes.reduce((groups, route) => {
    const [startStation] = route.route.split(' - ');
    if (!groups[startStation]) {
      groups[startStation] = [];
    }
    groups[startStation].push(route);
    return groups;
  }, {} as GroupedRoutes);

  // Sort the groups alphabetically by start station name
  return Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b, 'en', {sensitivity: 'base'}))
    .reduce((sortedGroups, key) => {
      sortedGroups[key] = grouped[key];
      return sortedGroups;
    }, {} as GroupedRoutes);
}


// Replace the main return section with this simplified version:

export default async function StationsPage() {
  const routes = await getRoutes();
  const groupedRoutes = groupRoutesByStartStation(routes);
  const stationGroups = Object.keys(groupedRoutes);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thailand Railway Stations - Station Wise Train Schedule & Routes
          </h1>
          <p className="text-gray-700 mb-6">
            Explore all major Thailand railway stations and check station wise train schedules,
            departure routes, and railway connections across the country. Whether you are
            traveling from Bangkok, Chiang Mai, Ayutthaya, or southern Thailand, you can
            easily find detailed railway station information and available train routes.
          </p>
        </div>

        <Image
          src="/thai-train.jpg"
          alt="Thailand Railway Train Journey"
          width={600}
          height={300}
          className="mx-auto my-8"
        />

        <SearchStationButton 
          stations={stationGroups}
          routes={routes}
        />

        {/* Compact Station Grid */}
        <div className="grid grid-cols-2  gap-3 mt-8">
          {stationGroups.map((stationName) => (
            <Link
              key={stationName}
              href={`/stations/${stationName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')}`}
              prefetch={false}
              className="group px-4 py-3 bg-white rounded-md border border-gray-200 
                      hover:border-blue-400 hover:bg-blue-50 
                        hover:shadow-2xl hover:-translate-y-2 
                        transition-all duration-300 ease-in-out 
                        text-sm transform"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-800 group-hover:text-blue-600 truncate">
                  {stationName} Station
                </span>
                <span className="text-xs text-gray-500">
                  {groupedRoutes[stationName].length} train routes available
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}