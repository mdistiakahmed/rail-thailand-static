// file: scraper/5-generate-trains-by-stations.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TRAINS_BY_ID_DIR = path.join(__dirname, 'data', 'trains-by-id');
const OUTPUT_DIR = path.join(__dirname, 'data', 'trains-by-stations');

// Helper function to format station name for filename
function formatStationName(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Replace multiple hyphens with single
        .trim();
}

// Helper function to get operating days string
function getOperatingDaysString(operatingDays, offDays) {
    if (operatingDays.length === 7) return 'Daily';
    if (operatingDays.length === 0) return 'No operating days';
    return operatingDays.join(', ');
}

// Helper function to get weekly off days
function getWeeklyOffDays(offDays) {
    if (offDays.length === 0) return 'None';
    if (offDays.length === 7) return 'All days';
    return offDays.join(', ');
}

// Helper function to normalize station names
function normalizeStationName(name) {
    return name.replace(/^thon buri$/i, 'Bangkok (Thon Buri)');
}

async function readTrainFiles() {
    try {
        const files = await fs.readdir(TRAINS_BY_ID_DIR);
        return files.filter(file => file.startsWith('train-') && file.endsWith('.json'));
    } catch (error) {
        console.error('Error reading train files:', error);
        return [];
    }
}

async function generateStationPairSchedules() {
    try {
        // Create output directory
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        
        // Read all train files
        const trainFiles = await readTrainFiles();
        console.log(`Found ${trainFiles.length} train files to process...`);
        
        // Map to store station pair schedules
        const stationPairMap = new Map();
        
        // Process each train file
        for (const file of trainFiles) {
            try {
                const filePath = path.join(TRAINS_BY_ID_DIR, file);
                const trainData = JSON.parse(await fs.readFile(filePath, 'utf8'));
                
                if (!trainData.trainData || !trainData.scheduleData) {
                    console.warn(`Skipping ${file}: Missing trainData or scheduleData`);
                    continue;
                }
                
                const { train_code, begin: beginStation, end: endStation } = trainData.trainData;
                const { operatingDays, offDays } = trainData;
                
                console.log(`Processing train ${train_code}: ${beginStation} → ${endStation}`);
                
                // Process each consecutive station pair in the schedule
                for (let i = 0; i < trainData.scheduleData.length - 1; i++) {
                    for(let j = i+1; j < trainData.scheduleData.length; j++) {
                        const currentStop = trainData.scheduleData[i];
                        const nextStop = trainData.scheduleData[j];
                        
                        // Only process if current stop has departure time and next stop has arrival time
                        if (currentStop.depart_time && nextStop.arrive_time) {
                            const startStationCode = currentStop.station_code;
                            const endStationCode = nextStop.station_code;
                            const startStationName = normalizeStationName(currentStop.station_name);
                            const endStationName = normalizeStationName(nextStop.station_name);
                            
                            const key = `${startStationCode}-${endStationCode}`;
                            
                            // Initialize array if not exists
                            if (!stationPairMap.has(key)) {
                                stationPairMap.set(key, []);
                            }

                            const firstStop = trainData.scheduleData[0];
                            const lastStop = trainData.scheduleData[trainData.scheduleData.length - 1];
                            
                            // Create train schedule object
                            const scheduleObject = {
                                train_code: train_code,
                                departure_from_start: firstStop.depart_time || 'N/A',
                                arrival_at_current: currentStop.arrive_time || 'N/A',
                                departure_from_current: currentStop.depart_time || 'N/A',
                                arrival_at_to_station: nextStop.arrive_time || 'N/A',
                                arrival_at_end: lastStop.arrive_time || 'N/A',
                                weekly_offday: getWeeklyOffDays(offDays),
                                operating_days: getOperatingDaysString(operatingDays, offDays),
                                train_type: trainData.trainData.train_type || 'Regular',
                                begin_station_name: startStationName,
                                end_station_name: endStationName,
                                begin_station_code: startStationCode,
                                end_station_code: endStationCode
                            };
                            
                            stationPairMap.get(key).push(scheduleObject);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
                continue;
            }
        }
        
        console.log(`\nGenerated schedules for ${stationPairMap.size} station pairs`);
        
        // Save each station pair to a separate file
        // Save each station pair to a separate file
        let filesCreated = 0;
        for (const [key, schedules] of stationPairMap) {
            try {
                // Extract station codes from key
                const [startCode, endCode] = key.split('-').map(Number);
                
                // Find station names from the first schedule
                const firstSchedule = schedules[0];
                const startStationName = firstSchedule.begin_station_name;
                const endStationName = firstSchedule.end_station_name;
                
                // Create filename (exact order, no swapping)
                const filename = `${formatStationName(startStationName)}-to-${formatStationName(endStationName)}.json`;
                const filePath = path.join(OUTPUT_DIR, filename);
                
                // Sort schedules by departure_from_current time
                schedules.sort((a, b) => a.departure_from_current.localeCompare(b.departure_from_current));
                
                // Save to file
                await fs.writeFile(filePath, JSON.stringify(schedules, null, 2));
                console.log(`✅ Created: ${filename} (${schedules.length} schedules)`);
                filesCreated++;
                
            } catch (error) {
                console.error(`Error saving file for key ${key}:`, error.message);
            }
        }

        // Generate all-trips.json file
        const allTrips = [];
        for (const [key, schedules] of stationPairMap) {
            if (schedules.length > 0) {
                const firstSchedule = schedules[0];
                const routeName = `${firstSchedule.begin_station_name} - ${firstSchedule.end_station_name}`;
                const filename = `${formatStationName(firstSchedule.begin_station_name)}-to-${formatStationName(firstSchedule.end_station_name)}.json`;
                
                allTrips.push({
                    route: routeName,
                    filename: filename
                });
            }
        }

        // Sort all trips by route name
        allTrips.sort((a, b) => a.route.localeCompare(b.route));

        // Save all-trips.json
        const allTripsFile = path.join(OUTPUT_DIR, 'all-trips.json');
        await fs.writeFile(allTripsFile, JSON.stringify({ routes: allTrips }, null, 2));
        console.log(`\n✅ Generated all-trips.json with ${allTrips.length} routes`);
        
        console.log(`\nSuccessfully created ${filesCreated} station pair schedule files!`);
        
    } catch (error) {
        console.error('Error generating station pair schedules:', error);
        process.exit(1);
    }
}

// Run the script
generateStationPairSchedules().catch(console.error);