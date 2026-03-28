import fs from 'fs';
import path from 'path';
import { FaQuestionCircle, FaRegCommentDots } from "react-icons/fa";


export function getTrainData(id: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'trains-by-id', `train-${id}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    return null;
  }
}

export function generateTrainStructuredData(
  train: any,
  firstStop: any,
  lastStop: any
) {
  return <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TrainTrip",
      "name": `Train ${train.train_code}`,
      "departureStation": {
        "@type": "TrainStation",
        "name": train.begin
      },
      "arrivalStation": {
        "@type": "TrainStation",
        "name": train.end
      },
      "departureTime": firstStop.depart_time,
      "arrivalTime": lastStop.arrive_time,
      "provider": {
        "@type": "Organization",
        "name": "State Railway of Thailand"
      }
    })
  }}
/>

}

export function calculateDuration(depart: string, arrive: string) {
  if (!depart || !arrive) return null;

  const [depH, depM] = depart.split(':').map(Number);
  const [arrH, arrM] = arrive.split(':').map(Number);

  let depMinutes = depH * 60 + depM;
  let arrMinutes = arrH * 60 + arrM;

  if (arrMinutes < depMinutes) {
    arrMinutes += 24 * 60; // handle overnight trains
  }

  const total = arrMinutes - depMinutes;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return `${hours}h ${minutes}m`;
}

/* ================= TRAIN FAQ SECTION ================= */
export function generateTrainFAQ(
  train: any,
  scheduleData: any[],
  operatingDays: string[],
  duration: string | null
) {
  if (!train || !scheduleData?.length) return null;

  const firstStop = scheduleData[0];
  const lastStop = scheduleData[scheduleData.length - 1];

  const majorStops = scheduleData
    .slice(1, 6)
    .map((s: any) => s.station_name)
    .join(", ");

  const faqData = [
    {
      question: `What time does Train ${train.train_code} depart from ${train.begin}?`,
      answer: `Train ${train.train_code} departs from ${train.begin} at ${firstStop.depart_time}. Passengers are advised to arrive at the station at least 15–30 minutes before departure time.`,
    },
    {
      question: `What time does Train ${train.train_code} arrive in ${train.end}?`,
      answer: `Train ${train.train_code} arrives at ${train.end} at ${lastStop.arrive_time}. Arrival times may vary slightly depending on operational conditions.`,
    },
    {
      question: `How long is the journey on Train ${train.train_code}?`,
      answer: duration
        ? `The total travel time from ${train.begin} to ${train.end} on Train ${train.train_code} is approximately ${duration}. The duration may differ depending on stops and track conditions.`
        : `The journey duration depends on the route and scheduled stops.`,
    },
    {
      question: `How many stations does Train ${train.train_code} stop at?`,
      answer: `Train ${train.train_code} stops at ${scheduleData.length} stations between ${train.begin} and ${train.end}, including major stations such as ${majorStops}.`,
    },
    {
      question: `On which days does Train ${train.train_code} operate?`,
      answer: operatingDays?.length === 7
        ? `Train ${train.train_code} operates daily (7 days a week) between ${train.begin} and ${train.end}.`
        : `Train ${train.train_code} operates on ${operatingDays?.join(", ") || "specific scheduled days"}. Please check the timetable above for exact running days.`,
    },
    {
      question: `Is Train ${train.train_code} operated by Thailand Railway?`,
      answer: `Yes, Train ${train.train_code} is operated by the State Railway of Thailand (SRT) and follows the official Thailand railway timetable.`,
    },
  ];

  return (
    <div className="mt-16 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
        Train No. {train.train_code} - Frequently Asked Questions
      </h2>

      <div className="space-y-8">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100"
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


// Function to get popular trains on similar routes
export async function getPopularTrains(currentTrainId: string, limit: number = 10) {
  try {
    const trainDir = path.join(process.cwd(), 'data', 'trains-by-id');
    const files = fs.readdirSync(trainDir);
    
    const allTrains = files
      .filter(file => file.startsWith('train-') && file.endsWith('.json'))
      .map(file => parseInt(file.replace('train-', '').replace('.json', '')))
      .sort((a, b) => a - b);
    
    const currentIndex = allTrains.indexOf(parseInt(currentTrainId));
    
    // Get 10 trains before and after current train
    const startRange = Math.max(0, currentIndex - limit);
    const endRange = Math.min(allTrains.length, currentIndex + limit);
    
    const popularTrains = allTrains.slice(startRange, endRange);
    
    return popularTrains.map(trainId => {
      const trainData = getTrainData(trainId.toString());
      return {
        trainId: trainId.toString(),
        trainCode: trainData?.trainData?.train_code || `Train ${trainId}`,
        route: trainData?.trainData?.begin ? `${trainData.trainData.begin} to ${trainData.trainData.end}` : 'Unknown Route',
      };
    });
  } catch (error) {
    return [];
  }
}

// Function to get popular routes from a station
export async function getPopularRoutesFromStation(stationName: string, limit: number = 8) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'trains-by-stations', 'all-trips.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    const routes = data.routes
      .filter((route: any) => route.route.startsWith(`${stationName} - `))
      .map((route: any) => ({
        name: route.route.split(' - ')[1],
        slug: route.filename.replace('.json', ''),
      }))
      .slice(0, limit);
    
    return routes;
  } catch (error) {
    return [];
  }
}
 


// Function to get popular travel articles
export async function getPopularTravelArticles(limit: number = 8) {
  try {
    const { getAllBlogs } = await import('@/sanity/lib/sanity');
    const blogs = await getAllBlogs();
    
    return blogs
      .slice(0, limit)
      .map((blog: any) => ({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        coverImage: blog.coverImage,
      }));
  } catch (error) {
    return [];
  }
}