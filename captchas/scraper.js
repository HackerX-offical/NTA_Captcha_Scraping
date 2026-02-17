const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Script to scrape CAPTCHA images until they start repeating.
 * It uses the configuration from the original index.js.
 */

const CAPTCHA_DIR = path.join(__dirname, 'captchas');

// Ensure the captchas directory exists
if (!fs.existsSync(CAPTCHA_DIR)) {
    fs.mkdirSync(CAPTCHA_DIR);
    console.log(`Created directory: ${CAPTCHA_DIR}`);
}

const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://examinationservices.nic.in/ResultoService26/JE26S1P1/ShowCaptchaImage',
    headers: { 
        'DNT': '1', 
        'Upgrade-Insecure-Requests': '1', 
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', 
        'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"', 
        'sec-ch-ua-mobile': '?1', 
        'sec-ch-ua-platform': '"Android"', 
        'Cookie': 'ASP.NET_SessionId=225l3uw4t3nrhlzde5ham0cf'
    },
    responseType: 'arraybuffer' // Crucial to get the raw image data
};

const seenHashes = new Set();
let totalScraped = 0;

async function scrapeCaptchas() {
    console.log('Starting CAPTCHA scraper...');
    
    while (true) {
        try {
            const response = await axios.request(config);
            const buffer = Buffer.from(response.data);
            
            // Generate a hash of the image data to detect exact repeats
            const hash = crypto.createHash('sha256').update(buffer).digest('hex');

            if (seenHashes.has(hash)) {
                console.log('\nRepeat detected!');
                console.log(`Final Count of Unique CAPTCHAs: ${seenHashes.size}`);
                console.log('Stopping scraper.');
                break;
            }

            seenHashes.add(hash);
            totalScraped++;

            // Save the image
            const filename = `captcha_${totalScraped}_${hash.substring(0, 8)}.jpg`;
            const filePath = path.join(CAPTCHA_DIR, filename);
            fs.writeFileSync(filePath, buffer);

            process.stdout.write(`\rScraped: ${totalScraped} unique images...`);

            // Optional: small delay to be polite to the server
            // await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error('\nError during scraping:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
            }
            break;
        }
    }
}

scrapeCaptchas();
