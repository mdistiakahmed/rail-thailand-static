// file: scraper/railway-api.js
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = 'https://ttsview.railway.co.th/ttsAPI';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpcCI6IjEwNC4yOC4yMTQuMTQ3IiwidWEiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQzLjAuMC4wIFNhZmFyaS81MzcuMzYiLCJyb2xlIjoidmlld2VyIiwiaWF0IjoxNzY4MDM0MDQyLCJleHAiOjE3NjgwMzQ0MDJ9.l-M_3wnjT8CCsUa0OYoA7x7KW4V1TVVeYfGp5WgapX4';
const START_MASTER_ID = 223;
const END_MASTER_ID = 250;
const DELAY_BETWEEN_REQUESTS = 1000;

// Common headers
const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'authorization': `Bearer ${AUTH_TOKEN}`,
    'priority': 'u=1, i',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
};

async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...headers, ...options.headers }
            });
            
            if (response.ok) {
                return await response.json();
            }
            
            if (response.status === 429) { // Too Many Requests
                const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10) * 1000;
                console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryAfter));
                continue;
            }
            
            throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Attempt ${i + 1} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
}

async function getTrainTrackingList() {
    console.log('Fetching train tracking list...');
    const url = `${API_BASE_URL}/getTrainTrackingList?lang=en`;
    return fetchWithRetry(url);
}

async function getStationList() {
    console.log('Fetching station list...');
    const url = `${API_BASE_URL}/getStationList?bkkFlag=en`;
    return fetchWithRetry(url);
}

async function saveDataToFile(data, filename) {
    const dir = path.join(__dirname, 'data');
    const filePath = path.join(dir, filename);
    
    try {
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Data saved to ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

// Add these new functions to your existing script
async function getTrainDetailsByDate(masterID, searchDate) {
    console.log(`Fetching train details for ID: ${masterID} on ${searchDate}...`);
    const url = `${API_BASE_URL}/trainByDate?masterID=${masterID}&searchDate=${searchDate}&lang=en&runReturn=0`;
    return fetchWithRetry(url);
}
async function getTrainSchedule(detailsalt, searchDate) {
    console.log(`Fetching schedule for train with detailsalt: ${detailsalt}...`);
    const url = `${API_BASE_URL}/getScheduleTrainDetail?qParam=${detailsalt}&selDate=${searchDate}&lang=en`;
    return fetchWithRetry(url);
}

async function processTrainSchedules() {
    try {
        const resultDir = path.join(__dirname, 'data', 'trains');
        await fs.mkdir(resultDir, { recursive: true });

        // Process trains with master IDs from 1 to 250
        for (let masterId = START_MASTER_ID; masterId <= END_MASTER_ID; masterId++) {
            try {
                console.log(`\nProcessing train with master ID: ${masterId}`);
                let hasSchedule = false;
                const scheduleData = {
                    masterId,
                    operatingDays: new Set(),
                    offDays: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
                    schedules: {}
                };

                // Check next 7 days
                for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
                    const date = new Date();
                    date.setDate(date.getDate() + dayOffset);
                    const searchDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

                    try {
                        // Get train details for this date
                        const trainDetails = await getTrainDetailsByDate(masterId, searchDate);
                        
                        if (trainDetails && trainDetails.length > 0 && trainDetails[0].detailsalt) {
                            hasSchedule = true;
                            const schedule = await getTrainSchedule(trainDetails[0].detailsalt, searchDate);
                            
                            if (schedule) {
                                // Add to operating days
                                scheduleData.operatingDays.add(dayName);
                                scheduleData.offDays.delete(dayName);
                                
                                // Only store the schedule data once
                                if (!scheduleData.trainData) {
                                    scheduleData.trainData = schedule.trainData;
                                    scheduleData.scheduleData = schedule.scheduleData;
                                }
                                
                                console.log(`✓ Found schedule for ${searchDate} (${dayName})`);
                            }
                            
                            // Add delay between requests
                            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
                        }
                    } catch (error) {
                        console.error(`Error processing ${searchDate}:`, error.message);
                        continue;
                    }
                }

                // Only save if we found at least one schedule
                if (hasSchedule) {
                    // Convert Sets to Arrays and format the output
                    const output = {
                        ...scheduleData,
                        operatingDays: Array.from(scheduleData.operatingDays).sort((a, b) => 
                            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                                .indexOf(a) - ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(b)
                        ),
                        offDays: Array.from(scheduleData.offDays).sort((a, b) => 
                            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                                .indexOf(a) - ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(b)
                        )
                    };

                    // Save to file
                    const outputFile = path.join(resultDir, `train-${masterId}.json`);
                    await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
                    console.log(`✅ Saved schedule for train ${masterId} to ${outputFile}`);
                } else {
                    console.log(`ℹ️ No schedules found for train ${masterId} in the next 7 days`);
                }

                // Add a small delay between processing different trains
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Error processing train ${masterId}:`, error.message);
                continue;
            }
        }

        console.log('\nAll trains processed successfully!');
    } catch (error) {
        console.error('Error in processTrainSchedules:', error);
        throw error;
    }
}

async function main() {
    try {
        // Fetch train tracking data
        const trainTrackingData = await getTrainTrackingList();
        await saveDataToFile(trainTrackingData, 'train-tracking.json');
        console.log('Train tracking data:', trainTrackingData);

        // Fetch station list
        const stationList = await getStationList();
        await saveDataToFile(stationList, 'stations.json');
        console.log('Station list data:', stationList.slice(0, 5), '...'); // Log first 5 stations

        // Process train schedules
        await processTrainSchedules();
        console.log('All data fetched and saved successfully!');
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

// Run the script
main().catch(console.error);