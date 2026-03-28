// scripts/generate-city-schedules.js
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// City to station mapping
const CITY_STATIONS = {
  Bangkok: [
    "Bangkok (Hua Lamphong)",
    "Bangkok (Krung Thep Aphiwat)",
    "Bangkok (Thon Buri)",
  ],
  "Chiang Mai": ["Chiang Mai"],
  Pattaya: ["Chuck Samet"],
  Phuket: ["Surat Thani"],
  Ratchaburi: ["Ratchaburi"],
  Ayutthaya: ["Ayutthaya"],
  "Hua Hin": ["Hua Hin"],
  "Nakhon Pathom": ["Nakhon Pathom"],
};

// Function to normalize station name to full format
function normalizeStationName(stationName) {
  if (!stationName) return null;
  
  const name = stationName.toLowerCase().trim();
  
  // Bangkok station mappings
  const bangkokStations = {
    "hua lamphong": "Bangkok (Hua Lamphong)",
    "krung thep aphiwat": "Bangkok (Krung Thep Aphiwat)",
    "thon buri": "Bangkok (Thon Buri)",
    "krungthep aphiwat": "Bangkok (Krung Thep Aphiwat)"
  };
  
  // Check if it's a Bangkok station
  for (const [key, fullName] of Object.entries(bangkokStations)) {
    if (name.includes(key)) {
      return fullName;
    }
  }
  
  // Check other cities
  for (const [city, stations] of Object.entries(CITY_STATIONS)) {
    if (city === "Bangkok") continue;
    
    for (const station of stations) {
      const stationLower = station.toLowerCase();
      if (name === stationLower || name.includes(stationLower) || stationLower.includes(name)) {
        return station; // Return the full name from CITY_STATIONS
      }
    }
  }
  
  return stationName; // Return original if no match found
}

// Function to load all train data
async function loadAllTrains() {
  try {
    const trainsDir = path.join(__dirname, "./data/trains-by-id"); // Fixed path
    const files = await fs.readdir(trainsDir);
    const trains = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(trainsDir, file);
        const content = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(content);
        trains.push(data);
      }
    }

    return trains;
  } catch (error) {
    console.error("Error loading trains:", error);
    throw error;
  }
}


// Function to get city for a station
function getCityForStation(stationName) {
  if (!stationName) return null;
  for (const [city, stations] of Object.entries(CITY_STATIONS)) {
    if (stations.some((s) => stationName.includes(s))) {
      return city;
    }
  }

  const stationLower = stationName.toLowerCase();
  if (stationLower.includes("hua lamphong") || 
      stationLower.includes("krungthep") || 
      stationLower.includes("thon buri") ||
      stationLower.includes("bangkok")) {
    return `Bangkok`;
  }
  return null;
}

// Helper function to calculate duration between two times
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return "N/A";

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let totalMinutes = endH * 60 + endM - (startH * 60 + startM);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`.trim();
}

// Helper function to convert city names to URL-friendly format
function toCityKey(city) {
  return city.toLowerCase().replace(/\s+/g, "-");
}

// Function to process trains and generate city schedules
async function generateCitySchedules() {
  try {
    const trains = await loadAllTrains();
    if (!trains || !Array.isArray(trains)) {
      throw new Error("Failed to load train data");
    }

    const citySchedules = {};

    // Initialize city pairs
    for (const city1 of Object.keys(CITY_STATIONS)) {
      for (const city2 of Object.keys(CITY_STATIONS)) {
        if (city1 !== city2) {
          const key = `${toCityKey(city1)}-to-${toCityKey(city2)}`;
          citySchedules[key] = [];
        }
      }
    }

    console.log(trains.length);

    // Process each train
    for (const train of trains) {
      //if(train.trainData.train_code !== '254') continue;
      //console.log(JSON.stringify(train.trainData.train_code, null, 2));
      try {
        const trainData = train.trainData || {};
        const scheduleData = Array.isArray(train.scheduleData)
          ? train.scheduleData
          : [];

        // Get all city stops for this train
        const cityStops = [];
        for (const stop of scheduleData) {
          if (!stop?.station_name) continue;

          const city = getCityForStation(stop.station_name);
          //console.log(JSON.stringify(city, null, 2));
          if (
            city &&
            (!cityStops.length || cityStops[cityStops.length - 1].city !== city)
          ) {
            cityStops.push({
              city,
              station: normalizeStationName(stop.station_name),
              arrive_time: stop.arrive_time || "",
              depart_time: stop.depart_time || "",
            });
          }
        }

        //console.log(JSON.stringify(cityStops, null, 2));

        // Generate city-to-city segments
        for (let i = 0; i < cityStops.length; i++) {
          for (let j = i + 1; j < cityStops.length; j++) {
            const fromCity = cityStops[i].city;
            const toCity = cityStops[j].city;
            const key = `${toCityKey(fromCity)}-to-${toCityKey(toCity)}`;

            if (citySchedules[key]) {
              citySchedules[key].push({
                train_no: trainData.train_code || "N/A",
                train_name: trainData.train_name || "",
                train_type: trainData.train_type || "N/A",
                from_station: cityStops[i].station,
                to_station: cityStops[j].station,
                depart_time: cityStops[i].depart_time || "N/A",
                arrive_time: cityStops[j].arrive_time || "N/A",
                duration: calculateDuration(
                  cityStops[i].depart_time,
                  cityStops[j].arrive_time,
                ),
              });
            }
          }
        }
      } catch (error) {
        console.error(
          "Error processing train:",
          train?.trainData?.train_code,
          error,
        );
      }
    }

    // Save city schedules
    const outputDir = path.join(__dirname, "./data/city-schedules");
    await fs.mkdir(outputDir, { recursive: true });

    for (const [cities, schedules] of Object.entries(citySchedules)) {
      if (schedules.length > 0) {
        console.log(cities);
        const [fromCity, toCity] = cities.split("-to-");
        const filename = `${fromCity.toLowerCase().replace(/\s+/g, "-")}-to-${toCity.toLowerCase().replace(/\s+/g, "-")}.json`;
        const filePath = path.join(outputDir, filename);

        await fs.writeFile(
          filePath,
          JSON.stringify(
            {
              from_city: fromCity.replace(/-/g, " "),
              to_city: toCity.replace(/-/g, " "),
              schedules: schedules.sort((a, b) =>
                (a.depart_time || "").localeCompare(b.depart_time || ""),
              ),
            },
            null,
            2,
          ),
        );
      }
    }

    console.log("City schedules generated successfully!");
  } catch (error) {
    console.error("Error generating city schedules:", error);
    process.exit(1);
  }
}

// Run the script
generateCitySchedules().catch(console.error);
