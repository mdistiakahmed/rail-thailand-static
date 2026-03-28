import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  { source: "Krung Thep Aphiwat", destination: "Surat Thani" },
  { source: "Krung Thep Aphiwat", destination: "Chiang Mai" },
  { source: "Bangkok", destination: "Pattaya" },
];

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getStations(page) {
    try {
        console.log('Fetching station data from API...');
        
        // Intercept the API response
        const response = await page.evaluate(async () => {
            try {
                const response = await fetch('https://dticket.railway.co.th/DTicketPublicWeb/home/Home/getStation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: 'LineId=&viewStateHolder=' + encodeURIComponent(document.querySelector('input[name="viewStateHolder"]')?.value || '')
                });
                return await response.json();
            } catch (error) {
                console.error('Error fetching stations:', error);
                return null;
            }
        });

        if (response && response.data) {
            const stations = response.data.map(station => ({
                stationId: station.stationId,
                stationNo: station.stationNo,
                stationNameEn: station.stationNameEn.replace(/\*\*/g, '').trim(),
                stationCodeEn: station.stationCodeEn
            }));

            const outputPath = path.join(__dirname, 'data', 'stations.json');
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, JSON.stringify(stations, null, 2));
            console.log(`Station data saved to ${outputPath}`);
            return stations;
        }
        return [];
    } catch (error) {
        console.error('Error in getStations:', error);
        return [];
    }
}

async function fetchOneDayData(page, startStationId, endStationId, date) {
    try {
        const response = await page.evaluate(async (startId, endId, tripDate) => {
            try {
                const formData = new URLSearchParams();
                formData.append('tripType', '1');
                formData.append('provinceStartId', startId);
                formData.append('provinceEndId', endId);
                formData.append('dateStart', tripDate);
                formData.append('dateEnd', '');
                formData.append('viewStateHolder', '');
                
                const response = await fetch('https://dticket.railway.co.th/DTicketPublicWeb/booking/booking/getTrip', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                const data = await response.json();
                return data?.data?.map(trip => ({
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    trainTypeNameEn: trip.trainTypeNameEn,
                    trainNo: trip.trainNo
                })) || [];
            } catch (error) {
                console.error('Error fetching trip data:', error);
                return [];
            }
        }, startStationId, endStationId, date);
        return response;
    } catch (error) {
        console.error('Error in fetchOneDayData:', error);
        return [];
    }
}


async function fetchTripData(page, startStationId, endStationId) {
    try {
        const allTrips = [];
        const date = new Date();

        for (let i = 1; i <= 7; i++) {
            date.setDate(date.getDate() + 1);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            

            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            console.log(`Checking ${dayOfWeek} (${formattedDate})...`);

            const trips = await fetchOneDayData(page, startStationId, endStationId, formattedDate);
            
            console.log(`Found ${trips.length} trips for ${dayOfWeek}`);
            const tripsWithDay = trips.map(trip => ({
                ...trip,
                operatingDay: dayOfWeek
            }));
            allTrips.push(...tripsWithDay);

            await delay(2000);
        }

        console.log(`Total trips found: ${allTrips.length}`);

        // Group trips by train number
        const tripsByTrain = allTrips.reduce((acc, trip) => {
            const trainNo = trip.trainNo;
            if (!acc[trainNo]) {
                acc[trainNo] = {
                    trainNo,
                    trainTypeNameEn: trip.trainTypeNameEn,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    operatingDays: []
                };
            }
            
            // Add day if not already in the list
            if (!acc[trainNo].operatingDays.includes(trip.operatingDay)) {
                acc[trainNo].operatingDays.push(trip.operatingDay);
            }
            
            return acc;
        }, {});

        console.log(`Total trains found: ${Object.keys(tripsByTrain).length}`);

        // Convert to array and add offDay information
        const result = Object.values(tripsByTrain).map(train => {
            const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const offDays = allDays.filter(day => !train.operatingDays.includes(day));
            
            return {
                ...train,
                operatingDays: train.operatingDays.join(', '),
                offDay: offDays.length > 0 ? offDays.join(', ') : 'No off day'
            };
        });

        console.log(`Result: ${JSON.stringify(result, null, 2)}`);
        return result;

    } catch (error) {
        console.error('Error in fetchTripData:', error);
        return [];
    }
    
    
}

// Add this function to generate all unique station pairs
function generateAllStationPairs(stations) {
    const pairs = [];
    for (let i = 0; i < stations.length; i++) {
        for (let j = i + 1; j < stations.length; j++) {
            pairs.push({
                station1: stations[i],
                station2: stations[j]
            });
        }
    }
    return pairs;
}

async function saveCombinedTripData(forwardTrips, returnTrips, station1, station2) {
    if ((!forwardTrips || forwardTrips.length === 0) && (!returnTrips || returnTrips.length === 0)) {
        return false;
    }
    
    const fileName = `${station1.stationNameEn.toLowerCase().replace(/\s+/g, '-')}-to-${station2.stationNameEn.toLowerCase().replace(/\s+/g, '-')}.json`;
    const outputPath = path.join(__dirname, 'data', 'trips', fileName);
    
    const combinedData = {
        forward: forwardTrips,
        backward: returnTrips
    };
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(combinedData, null, 2));
    console.log(`Combined trip data saved to ${outputPath}`);
    return true;
}

async function scrapeThaiRailway() {
    console.log('Starting Thai Railway scraper...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Enable request interception to capture API calls
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            request.continue();
        });

        console.log('Navigating to Thai Railway website...');
        await page.goto('https://dticket.railway.co.th/DTicketPublicWeb/home/Home', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        console.log('Page loaded successfully');

        // Handle cookie acceptance
        try {
            await page.waitForSelector('.btn-cookie-consent-preview', { timeout: 5000 });
            await page.click('.btn-cookie-consent-preview');
            console.log('Accepted cookies');
            await delay(2000);
        } catch (e) {
            console.log('Cookie acceptance button not found or already accepted');
        }
		
		// Handle language selection
        try {
            // Click the language dropdown
            await page.waitForSelector('.dropdown-toggle.current-lang', { timeout: 5000 });
            await page.click('.dropdown-toggle.current-lang');
            console.log('Opened language dropdown');
            await delay(1000);

            // Click English language option
            const [englishBtn] = await page.$x("//a[contains(@class, 'switch-lang') and contains(., 'English')]");
            if (englishBtn) {
                await englishBtn.click();
                console.log('Selected English language');
                await delay(2000); // Wait for language to change
            }
        } catch (e) {
            console.log('Language selector not found or already in English');
        }

        // Get station data
        const stations = await getStations(page);
        console.log(`Fetched ${stations.length} stations`);


        // Inside the scrapeThaiRailway function, replace the date and trip fetching logic:

        // Generate tomorrow's date in DD/MM/YYYY format
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = `${String(tomorrow.getDate()).padStart(2, '0')}/${String(tomorrow.getMonth() + 1).padStart(2, '0')}/${tomorrow.getFullYear()}`;


        for (const route of routes) {
            try {
                // Get the stations for current route
                const fromStation = stations.find(s => s.stationNameEn.includes(route.source));
                const toStation = stations.find(s => s.stationNameEn.includes(route.destination));
                if (!fromStation || !toStation) {
                    console.error(`Required stations not found for route: ${route.source} to ${route.destination}`);
                    continue; // Skip this route if stations not found
                }
                console.log(`Processing route: ${fromStation.stationNameEn} to ${toStation.stationNameEn}`);
            
                const forwardTrips = await fetchTripData(page, fromStation.stationId, toStation.stationId);
                await delay(2000);

                console.log(`Fetching trips from ${toStation.stationNameEn} to ${fromStation.stationNameEn}...`);
                const returnTrips = await fetchTripData(page, toStation.stationId, fromStation.stationId);

                // Save combined data
                await saveCombinedTripData(forwardTrips, returnTrips, fromStation, toStation);

                console.log('Scraping completed successfully!');
            } catch (error) {
                console.error(`Error processing route ${route.source} to ${route.destination}:`, error);
            }
    
        }
        
        console.log('Scraping completed successfully!');

        /*

        // Generate all unique station pairs
        const allPairs = generateAllStationPairs(stations);
        console.log(`Generated ${allPairs.length} station pairs`);
        // Process each pair
        for (let i = 0; i < allPairs.length; i++) {
            const { station1, station2 } = allPairs[i];
            
            console.log(`\nProcessing pair ${i + 1}/${allPairs.length}: ${station1.stationNameEn} <-> ${station2.stationNameEn}`);
            
            try {
                // Fetch trips in both directions
                console.log(`  Fetching trips from ${station1.stationNameEn} to ${station2.stationNameEn}...`);
                const forwardTrips = await fetchTripData(page, station1.stationId, station2.stationId, formattedDate);
                await delay(2000); // Add delay between requests
                console.log(`  Fetching trips from ${station2.stationNameEn} to ${station1.stationNameEn}...`);
                const returnTrips = await fetchTripData(page, station2.stationId, station1.stationId, formattedDate);
                await delay(2000); // Add delay between pairs
                // Only save if at least one direction has trips
                if (forwardTrips.length > 0 || returnTrips.length > 0) {
                    await saveCombinedTripData(forwardTrips, returnTrips, station1, station2);
                } else {
                    console.log(`  No trips found for this pair, skipping...`);
                }
            } catch (error) {
                console.error(`  Error processing pair ${station1.stationNameEn} <-> ${station2.stationNameEn}:`, error.message);
                // Continue with the next pair even if one fails
                await delay(5000); // Longer delay after error
            }
        }


        */
    } catch (error) {
        console.error('Error during scraping:', error);
        // Take a screenshot if something goes wrong
        await page.screenshot({ path: 'error.png' });
        console.log('Screenshot saved as error.png');
    } finally {
        console.log('Closing browser in 5 seconds...');
        await delay(5000);
        await browser.close();
        console.log('Browser closed');
    }
}

// Create a data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Run the scraper
scrapeThaiRailway().catch(console.error);
