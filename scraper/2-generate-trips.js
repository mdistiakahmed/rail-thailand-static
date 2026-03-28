// file: scraper/generate-trips.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TRAINS_DIR = path.join(__dirname, 'data', 'trains');
const TRIPS_DIR = path.join(__dirname, 'data', 'trips');


// After processing the main route, check for intermediate stations of interest
const intermediateStations = {
    // 'Bangkok (Hua Lamphong)': {
    //     'Chiang Mai': ['Ayutthaya', 'Phitsanulok'],
    //     'Nong Khai': ['Ayutthaya', 'Khon Kaen', 'Udon Thani']
    // },
    'Bangkok (Thon Buri)': {
        'Nam Tok': ['Kanchanaburi']
    },
    'Nam Tok': {
        'Bangkok (Thon Buri)': ['Kanchanaburi']
    }
    // Add more routes and their important stations as needed
};

function findStationInSchedule(schedule, stationName) {
    // Try direct match first
    let station = schedule.find(s => 
        s.station_name === stationName || 
        s.station_name === stationName.replace('Bangkok (', '').replace(')', '')
    );
    
    // Try partial match for cases like "Bangkok (Hua Lamphong)" vs "Hua Lamphong"
    if (!station) {
        const simplifiedName = stationName.replace('Bangkok (', '').replace(')', '');
        station = schedule.find(s => 
            s.station_name.includes(simplifiedName) || 
            simplifiedName.includes(s.station_name)
        );
    }
    
    return station;
}

function normalizeStationName(name) {
    if (name.startsWith('Bangkok (')) {
        return name;
    }
    
    const bangkokStations = ['Thon Buri', 'Krung Thep Aphiwat', 'Hua Lamphong'];
    const station = bangkokStations.find(s => name === s || name.startsWith(s + ' '));
    if (station) {
        return `Bangkok (${station})`;
    }
    
    return name;
}

async function getTrainFiles() {
    try {
        const files = await fs.readdir(TRAINS_DIR);
        return files.filter(file => file.startsWith('train-') && file.endsWith('.json'));
    } catch (error) {
        console.error('Error reading train files:', error);
        return [];
    }
}

function formatOperatingDays(days) {
    if (!days || days.length === 0) return 'No operating days';
    if (days.length === 7) return 'Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday';
    return days.join(', ');
}

function getOffDay(days) {
    if (!days || days.length === 0) return 'No off day';
    if (days.length === 7) return 'No off day';
    return days.join(', ');
}

function createRouteFilename(begin, end) {
    const formatName = (name) => 
        name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
            .replace(/\s+/g, '-')          // Replace spaces with hyphens
            .replace(/-+/g, '-')           // Replace multiple hyphens with single
            .replace(/\s*-\s*/g, '-')      // Remove spaces around hyphens
            .trim();

    const [first, second] = [begin, end].sort();
    
    return `${formatName(first)}-to-${formatName(second)}.json`;
}

async function generateTrips() {
    try {
        await fs.mkdir(TRIPS_DIR, { recursive: true });
        const trainFiles = await getTrainFiles();
        
        // Object to store routes with forward and backward trips
        const routes = {};

        // Process each train file
        for (const file of trainFiles) {
            try {
                const filePath = path.join(TRAINS_DIR, file);
                const trainData = JSON.parse(await fs.readFile(filePath, 'utf8'));
                
                if (!trainData.trainData) continue;

                
                // Normalize station names
                const begin = normalizeStationName(trainData.trainData.begin);
                const end = normalizeStationName(trainData.trainData.end);

                const isForward = () => {
                    const isBeginBangkok = begin.startsWith('Bangkok (') || begin === 'Bangkok';
                    const isEndBangkok = end.startsWith('Bangkok (') || end === 'Bangkok';
                    
                    if (isBeginBangkok && !isEndBangkok) return true;
                    if (!isBeginBangkok && isEndBangkok) return false;
                    return begin <= end; // Fallback to alphabetical if both or neither are Bangkok
                };

                const { train_code, train_type } = trainData.trainData;
                const routeKey = [begin, end].sort((a, b) => {
                    // Sort Bangkok stations first
                    const aIsBangkok = a.startsWith('Bangkok');
                    const bIsBangkok = b.startsWith('Bangkok');
                    if (aIsBangkok && !bIsBangkok) return -1;
                    if (!aIsBangkok && bIsBangkok) return 1;
                    return a.localeCompare(b);
                }).join(' - ');
                
                // Initialize route if it doesn't exist
                if (!routes[routeKey]) {
                    routes[routeKey] = {
                        forward: [],
                        backward: []
                    };
                }

                // Get first and last station for arrival/departure times
                const firstStop = trainData.scheduleData[0];
                const lastStop = trainData.scheduleData[trainData.scheduleData.length - 1];
                
                const tripData = {
                    trainNo: train_code,
                    trainTypeNameEn: train_type || 'REGULAR',
                    departureTime: firstStop?.depart_time || 'N/A',
                    arrivalTime: lastStop?.arrive_time || 'N/A',
                    operatingDays: formatOperatingDays(trainData.operatingDays),
                    offDay: getOffDay(trainData.offDays)
                };

                // Add to appropriate route and direction
                const direction = isForward() ? 'forward' : 'backward';

                if (routeKey in routes) {
                    routes[routeKey][direction].push(tripData);
                }

                // Process intermediate routes
                const isForward1 = (x,y) => {
                    const isBeginBangkok = x.startsWith('Bangkok (') || x === 'Bangkok';
                    const isEndBangkok = y.startsWith('Bangkok (') || y === 'Bangkok';
                    
                    if (isBeginBangkok && !isEndBangkok) return true;
                    if (!isBeginBangkok && isEndBangkok) return false;
                    return x <= y; // Fallback to alphabetical if both or neither are Bangkok
                };


                const startStations = Object.keys(intermediateStations);
                
                if (startStations.includes(begin) && intermediateStations[begin][end]) {
                    const stations = intermediateStations[begin][end];
                    
                    for (const intermediate of stations) {
                        // Find the stations in the schedule
                        const startStation = findStationInSchedule(trainData.scheduleData, begin);
                        const endStation = findStationInSchedule(trainData.scheduleData, end);
                        const intermediateStation = findStationInSchedule(trainData.scheduleData, intermediate);
                        
                        if (startStation && endStation && intermediateStation) {
                            // Create segment from start to intermediate
                            const segmentKey = [begin, intermediate].sort((a, b) => 
                                a.startsWith('Bangkok') ? -1 : b.startsWith('Bangkok') ? 1 : a.localeCompare(b)
                            ).join(' - ');
                            
                            if (!routes[segmentKey]) {
                                routes[segmentKey] = { forward: [], backward: [] };
                            }
                            
                            const segmentTripData = {
                                ...tripData,
                                departureTime: startStation.depart_time || 'N/A',
                                arrivalTime: intermediateStation.arrive_time || 'N/A',
                                isSegment: true,
                                fullRoute: `${begin} - ${end}`
                            };
                            
                            const direction = isForward1(begin, intermediate) ? 'forward' : 'backward';
                            routes[segmentKey][direction].push(segmentTripData);
                            
                            // Also create segment from intermediate to end
                            const returnSegmentKey = [intermediate, end].sort((a, b) => 
                                a.startsWith('Bangkok') ? -1 : b.startsWith('Bangkok') ? 1 : a.localeCompare(b)
                            ).join(' - ');
                            
                            if (!routes[returnSegmentKey]) {
                                routes[returnSegmentKey] = { forward: [], backward: [] };
                            }
                            
                            const returnSegmentTripData = {
                                ...tripData,
                                departureTime: intermediateStation.depart_time || 'N/A',
                                arrivalTime: endStation.arrive_time || 'N/A',
                                isSegment: true,
                                fullRoute: `${begin} - ${end}`
                            };
                            
                            const returnDirection = intermediate <= end ? 'forward' : 'backward';
                            routes[returnSegmentKey][returnDirection].push(returnSegmentTripData);
                        }
                    }
                } else {
                    const matchingStart = startStations.find(start => 
                        intermediateStations[start] && 
                        Object.keys(intermediateStations[start]).includes(end)
                    );

                    if(matchingStart) {
                        
                    }
                }

            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
                continue;
            }
        }

        // Object to store all trip routes
        const allTrips = [];

        // Save each route to a separate file
        for (const [route, data] of Object.entries(routes)) {
            // Skip routes with no trains
            if (data.forward.length === 0 && data.backward.length === 0) {
                continue;
            }

            // Sort trains by departure time
            data.forward.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
            data.backward.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

            // Get the route parts
            const [begin, end] = route.split(' - ');
            const filename = createRouteFilename(begin, end);
            allTrips.push({
                route: `${begin} - ${end}`,
                filename: filename
            });

            const outputFile = path.join(TRIPS_DIR, filename);
            await fs.writeFile(outputFile, JSON.stringify(data, null, 2));
            console.log(`✅ Generated trip file: ${outputFile}`);
        }

        // Save all trips list
        if (allTrips.length > 0) {
            const allTripsFile = path.join(TRIPS_DIR, 'all-trips.json');
            await fs.writeFile(allTripsFile, JSON.stringify({ routes: allTrips }, null, 2));
            console.log(`\n✅ Generated all-trips.json with ${allTrips.length} routes`);
        }

        console.log('\nAll trip files generated successfully!');
    } catch (error) {
        console.error('Error generating trips:', error);
    }
}

// Run the script
generateTrips().catch(console.error);