// app/trains/page.tsx
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import { Metadata } from 'next';

export const dynamic = "force-static";
export const revalidate = false;


export const metadata: Metadata = {
  title: "Thailand Train List (2026) - All SRT Train Numbers & Routes | RailThailand",
  description:
    "Browse the complete list of Thailand trains operated by the State Railway of Thailand (SRT). Find train numbers, routes, service types, and departure stations across Bangkok, Chiang Mai, Hat Yai, Nong Khai and more.",
  keywords: [
    "Thailand train list",
    "SRT train numbers",
    "State Railway of Thailand trains",
    "Bangkok train routes",
    "Chiang Mai train schedule",
    "Thailand railway services",
    "Thai train directory"
  ],
  alternates: {
    canonical: "https://railthailand.com/trains",
  },
  openGraph: {
    title: "Complete Thailand Train Directory - RailThailand",
    description:
      "Explore all Thailand train services including train numbers, routes, and service categories operated by SRT.",
    url: "https://railthailand.com/trains",
    siteName: "RailThailand",
    type: "website",
    images: "/thai-train.jpg",
  },
};


interface TrainInfo {
  train_code: string;
  train_type: string;
  begin: string;
  end: string;
}

async function getAllTrains(): Promise<{ id: string; info: TrainInfo }[]> {
  const trainsDir = path.join(process.cwd(), 'data', 'trains-by-id');
  const files = fs.readdirSync(trainsDir);
  const trainFiles = files.filter(file => file.startsWith('train-') && file.endsWith('.json'));

  return trainFiles.map(file => {
    const id = file.replace('train-', '').replace('.json', '');
    const filePath = path.join(trainsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    return {
      id,
      info: {
        train_code: data.trainData?.train_code || 'N/A',
        train_type: data.trainData?.train_type || 'N/A',
        begin: data.trainData?.begin || 'N/A',
        end: data.trainData?.end || 'N/A'
      }
    };
  }).sort((a, b) => {
    // Convert train codes to numbers for proper numeric comparison
    const codeA = parseInt(a.info.train_code, 10) || 0;
    const codeB = parseInt(b.info.train_code, 10) || 0;
    return codeA - codeB;
  });
}

export default async function TrainsPage() {
  const trains = await getAllTrains();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Thailand Train Directory",
            itemListElement: trains.map((train, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `Train ${train.info.train_code} ${train.info.begin} to ${train.info.end}`,
              url: `https://railthailand.com/trains/${train.id}`,
            })),
          }),
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thailand Train List – All SRT Train Numbers, Routes & Service Types
          </h1>

          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Explore the complete directory of Thailand train services operated by the 
            State Railway of Thailand (SRT). This page lists all official train numbers, 
            including Special Express, Express, Rapid, and Ordinary services running 
            between major destinations such as Bangkok, Chiang Mai, Hat Yai, Nong Khai, 
            Ubon Ratchathani, and Surat Thani. 
          </p>

          <p className="text-gray-600 max-w-3xl mx-auto mt-4 leading-relaxed">
            Click on any train below to view detailed schedules, departure and arrival 
            times, route stops, and service information. Whether you are planning long-distance 
            travel or regional journeys, this Thailand railway train list helps you 
            quickly find the correct train number for your trip.
          </p>
        </div>


        <Image
          src="/thai-train.jpg"
          alt="Thailand Railway Train Journey"
          width={600}
          height={300}
          className="mx-auto my-8"
        />

        <div className="overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Train List
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {trains.map((train) => (
                <li key={train.id}>
                  <Link 
                    href={`/trains/${train.id}`}
                    prefetch={false}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-blue-600">
                             Train #{train.info.train_code}
                          </div>
                          <div className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {train.info.train_type}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {train.info.begin} → {train.info.end}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}