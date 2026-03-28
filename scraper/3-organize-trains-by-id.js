// scraper/3-organize-trains-by-id.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRAINS_DIR = path.join(__dirname, 'data', 'trains');
const OUTPUT_DIR = path.join(__dirname, 'data', 'trains-by-id');

async function organizeTrainsById() {
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Read all train files
    const files = await fs.readdir(TRAINS_DIR);
    const trainFiles = files.filter(file => file.startsWith('train-') && file.endsWith('.json'));

    console.log(`Found ${trainFiles.length} train files to process...`);

    // Process each train file
    for (const file of trainFiles) {
      try {
        const filePath = path.join(TRAINS_DIR, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const trainData = JSON.parse(fileContent);

        if (trainData.trainData?.train_code) {
          const trainCode = trainData.trainData.train_code;
          const outputFile = path.join(OUTPUT_DIR, `train-${trainCode}.json`);

          // Write the file with pretty-printed JSON
          await fs.writeFile(
            outputFile,
            JSON.stringify(trainData, null, 2),
            'utf8'
          );

          console.log(`Created: ${outputFile}`);
        } else {
          console.warn(`Skipping ${file}: No train code found`);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }

    console.log('All trains have been organized by ID!');
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Run the script
organizeTrainsById();