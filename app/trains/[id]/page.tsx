// app/trains/[id]/page.tsx
import { notFound } from 'next/navigation';
import { FaTrain, FaClock, FaMapMarkerAlt, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import { Metadata } from 'next';
import Image from 'next/image';
import { calculateDuration, generateTrainFAQ, generateTrainStructuredData, getPopularRoutesFromStation, getPopularTrains, getPopularTravelArticles, getTrainData } from './component';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-static";
export const revalidate = false;


export async function generateStaticParams() {
  try {
    const trainDir = path.join(process.cwd(), 'data', 'trains-by-id');
    const files = fs.readdirSync(trainDir);
    
    return files
      .filter(file => file.startsWith('train-') && file.endsWith('.json'))
      .map(file => ({
        id: file.replace('train-', '').replace('.json', '')
      }));
  } catch (error) {
    console.error('Error generating static params for trains:', error);
    return [];
  }
}

/* ---------------------------
   Metadata
---------------------------- */
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  const trainData = getTrainData(id);

  if (!trainData) {
    return {
      title: 'Train Not Found | RailThailand',
      description: 'The requested train information could not be found.'
    };
  }

  const { trainData: train, scheduleData } = trainData;
  const firstStop = scheduleData[0];
  const lastStop = scheduleData[scheduleData.length - 1];
  const duration = calculateDuration(firstStop.depart_time, lastStop.arrive_time);

  const title = `Train No. ${train.train_code} Timetable: ${train.begin} to ${train.end} - Full Schedule & Duration`;

  const description = `Train No. ${train.train_code} runs from ${train.begin} to ${train.end}. Departure at ${firstStop.depart_time}, arrival at ${lastStop.arrive_time}. Total travel time ${duration}. View full station schedule and operating days.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://railthailand.com/trains/${id}`
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: "/thai-train.jpg",
      url: `https://railthailand.com/trains/${id}`
    }
  };
}

function generateScheduleDescription(train: any, scheduleData: any[]) {
  if (!train || !scheduleData?.length) return null;

  const getStopDescription = (stop: any, index: number, isFirst: boolean, isLast: boolean) => {
    if (isFirst) {
      return (
        <p className="text-gray-900 font-medium">
          <span className="text-blue-600">Departure:</span> Train #{train.train_code} ({train.train_type}) departs from {stop.station_name} at <span className="font-semibold">{stop.depart_time}</span>.
        </p>
      );
    } else if (isLast) {
      return (
        <p className="text-gray-900 font-medium">
          <span className="text-green-600">Arrival:</span> The train arrives at its destination, {stop.station_name}, at <span className="font-semibold">{stop.arrive_time}</span>.
        </p>
      );
    } else {
      return (
        <p className="text-gray-700">
          <span className="text-gray-500">•</span> Stops at {stop.station_name}, arriving at <span className="font-medium">{stop.arrive_time}</span> and departing at <span className="font-medium">{stop.depart_time}</span>.
        </p>
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Journey Details</h3>
        <div className="space-y-4">
          {scheduleData.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === scheduleData.length - 1;
            
            return (
              <div 
                key={index} 
                className={`relative pl-6 pb-4 ${
                  !isLast ? 'border-l-2 border-gray-200' : ''
                }`}
              >
                <div className={`absolute left-0 w-3 h-3 rounded-full ${
                  isFirst ? 'bg-blue-500' : 
                  isLast ? 'bg-green-500' : 'bg-gray-400'
                }`} 
                style={{ left: '-6.5px', top: '6px' }} 
                />
                <div className={`${isFirst ? 'pt-0' : 'pt-1'}`}>
                  {getStopDescription(stop, index, isFirst, isLast)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Note:</span> This train operates {train.operatingDays?.length ? `on ${train.operatingDays.join(', ')}` : 'daily'}. 
          Please verify the schedule before your journey as timings may vary.
        </p>
      </div>
    </div>
  );
}

export default async function TrainDetailsPage({ params }: any) {
  const { id } = await params;
  const trainData = getTrainData(id);

  if (!trainData) {
    notFound();
  }

  const { trainData: train, scheduleData, operatingDays, offDays } = trainData;
  const firstStop = scheduleData[0];
  const lastStop = scheduleData[scheduleData.length - 1];
  const duration = calculateDuration(firstStop.depart_time, lastStop.arrive_time);


  // Get additional data for related sections
  const popularTrains = await getPopularTrains(id, 20);
  const fromStationRoutes = await getPopularRoutesFromStation(train.begin || '', 8);
  const toStationRoutes = await getPopularRoutesFromStation(train.end || '', 8);
  const travelArticles = await getPopularTravelArticles(8);

  const majorStops = scheduleData
    .slice(1, 6)
    .map((s: any) => s.station_name)
    .join(', ');


  return (
    <div className="min-h-screen w-screen md:w-full py-8 md:px-4">
      {generateTrainStructuredData(train, firstStop, lastStop)}
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-auto">
          {/* ================= H1 SECTION ================= */}
          <div className="text-center mb-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Train Number {train.train_code} from {train.begin} to {train.end} – 
              Complete Timetable & Travel Duration
            </h1>

            <p className="text-lg text-gray-700 mb-3">
              Train Number {train.train_code} operates between {train.begin} and {train.end}, 
              stopping at {scheduleData.length} stations across Thailand.
            </p>

            <p className="text-gray-600">
              Departure from {train.begin} at {firstStop.depart_time} and arrival in {train.end} at {lastStop.arrive_time}. 
              Total journey time is approximately <strong>{duration}</strong>.
              Major stops include {majorStops}.
            </p>
          </div>

          <Image
            src="/thai-train.jpg"
            alt="Thailand Railway Train Journey"
            width={400}
            height={200}
            className="mx-auto my-8"
          />

          {/* ================= ROUTE OVERVIEW ================= */}
          <div className="mt-12 mb-12">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                Train {train.train_code} Route Overview
              </h2>

              {/* Route Timeline */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">

                {/* Departure Card */}
                <div className="flex-1 bg-red-50 rounded-xl p-6 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-3">
                    <FaMapMarkerAlt className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm uppercase tracking-wide text-red-600 font-semibold">
                      Departure
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {train.begin}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Departs at {firstStop.depart_time}
                  </p>
                </div>

                {/* Middle Line */}
                <div className="hidden md:flex flex-col items-center flex-none px-4">
                  <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-500 mt-2">
                    Direct Railway Route
                  </span>
                </div>

                {/* Arrival Card */}
                <div className="flex-1 bg-green-50 rounded-xl p-6 text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-end mb-3">
                    <span className="text-sm uppercase tracking-wide text-green-600 font-semibold">
                      Arrival
                    </span>
                    <FaMapMarkerAlt className="h-5 w-5 text-green-500 ml-2" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {train.end}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Arrives at {lastStop.arrive_time}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-8"></div>

              {/* Duration + Operating Info */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="flex items-center text-gray-700">
                  <FaClock className="mr-3 text-blue-600 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Travel Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {duration}
                    </p>
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-500 mb-1">
                    Operating Schedule
                  </p>
                  <span className="inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full">
                    {operatingDays?.length === 7
                      ? 'Runs Daily (7 Days a Week)'
                      : operatingDays?.join(', ') || 'Daily'}
                  </span>
                </div>
              </div>

            </div>
          </div>



          {/* ================= FULL TIMETABLE ================= */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Full Timetable for Train No. {train.train_code}
            </h2>

            <p className="text-gray-600 mb-6">
              Below is the complete station-by-station schedule including arrival
              and departure times for Train {train.train_code} from {train.begin} to {train.end}.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Station
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Arrival
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Departure
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {scheduleData?.map((stop: any, index: number) => (
                    <tr key={index} className={stop.station_name === train.begin || stop.station_name === train.end ? 'bg-blue-50' : ''}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {stop.station_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {stop.arrive_time || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {stop.depart_time || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operating Days */}
          {operatingDays && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                <h3 className="ml-2 text-sm font-medium text-gray-900">Operating Days: {operatingDays.join(', ')}</h3>
              </div>
            </div>
          )}

          {generateScheduleDescription(train, scheduleData)}

          {generateTrainFAQ(train, scheduleData, operatingDays, duration)}

                  {/* ================= RELATED SECTIONS ================= */}
          
          {/* Popular Trains on Similar Routes */}
          {popularTrains.length > 0 && (
            <section className="max-w-6xl mx-auto mt-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                  <FaTrain className="text-blue-600" />
                  <span className="text-blue-600">Popular Trains on Similar Routes</span>
                </h2>
                <p className="text-gray-600 mt-2">
                  Explore other trains operating on routes similar to Train {train.train_code} 
                  {" "}from {train.begin} to {train.end}. These trains follow similar 
                  departure patterns and schedules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularTrains.map((trainInfo: any, index: number) => (
                  <Link
                    key={`train-${index}`}
                    href={`/trains/${trainInfo.trainId}`}
                    prefetch={false}
                    className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <FaTrain className="text-blue-500 text-xl" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Train {trainInfo.trainCode}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {trainInfo.route}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 group-hover:text-blue-600 font-semibold">
                        View Complete Schedule
                      </p>
                      <p className="text-xs text-gray-500">
                        Timetable and route information
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Popular Routes From Start Station */}
          {fromStationRoutes.length > 0 && (
            <section className="max-w-6xl mx-auto mt-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                  <FaTrain className="text-green-600" />
                  <span className="text-green-600">Popular Routes from {train.begin}</span>
                </h2>
                <p className="text-gray-600 mt-2">
                  Discover frequently travelled routes departing from {train.begin}. 
                  These railway connections link major destinations across Thailand.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fromStationRoutes.map((route: any, index: number) => (
                  <Link
                    key={`from-route-${index}`}
                    href={`/stations/${train.begin?.toLowerCase().replace(/\s+/g, '-')}/${route.slug}`}
                    prefetch={false}
                    className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4 text-green-600 mb-2">
                      <FaTrain className="text-sm" />
                      <span className="text-sm font-medium">
                        {train.begin} → {route.name}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 group-hover:text-green-600 font-semibold">
                      View Train Schedule
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Direct route • Multiple daily options
                      {route.slug.includes('express') && ' • Express service available'}
                      {route.slug.includes('rapid') && ' • Rapid trains'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Popular Routes To End Station */}
          {toStationRoutes.length > 0 && (
            <section className="max-w-6xl mx-auto mt-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                  <FaTrain className="text-red-600" />
                  <span className="text-red-600">Popular Routes to {train.end}</span>
                </h2>
                <p className="text-gray-600 mt-2">
                  Explore destinations reachable from {train.end}. These 
                  routes connect to major cities and tourist destinations across Thailand.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {toStationRoutes.map((route: any, index: number) => (
                  <Link
                    key={`to-route-${index}`}
                    href={`/stations/${train.end?.toLowerCase().replace(/\s+/g, '-')}/${route.slug}`}
                    prefetch={false}
                    className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-red-300 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4 text-red-600 mb-2">
                      <FaTrain className="text-sm" />
                      <span className="text-sm font-medium">
                        {train.end} → {route.name}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 group-hover:text-red-600 font-semibold">
                      View Train Schedule
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Direct connections • Scenic routes available
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Popular Travel Articles */}
          {travelArticles.length > 0 && (
            <section className="max-w-6xl mx-auto mt-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                  <FaTrain />
                  <span>Thailand Train Travel Guides</span>
                </h2>
                <p className="text-gray-600 mt-2">
                  Read expert travel tips and guides for exploring Thailand by 
                  train, including route planning, station information, and travel advice.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {travelArticles.map((article: any, index: number) => (
                  <Link
                    key={`article-${index}`}
                    href={`/blogs/${article.slug}`}
                    prefetch={false}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-purple-300 hover:shadow-md transition"
                  >
                    {article.coverImage && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={article.coverImage.asset.url}
                          alt={article.coverImage.alt || article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {article.category || 'Travel Guide'}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="mt-3 text-base text-gray-500 line-clamp-3">
                          {article.excerpt}
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

