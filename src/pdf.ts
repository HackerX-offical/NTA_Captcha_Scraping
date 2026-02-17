import puppeteer from "puppeteer";
import path from "path";
import { CONFIG } from "./config";
import { logger } from "./logger";

export class PDFGenerator {
  static async generate(applicationNo: string, html: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      // We set the content with a base URL so all relative CSS/Images load correctly
      await page.goto(CONFIG.baseUrl, { waitUntil: "networkidle0" });
      await page.setContent(html, { waitUntil: "networkidle0" });

      const fileName = `JEE_Result_${applicationNo}.pdf`;
      const filePath = path.join(process.cwd(), "results", "pdfs", fileName);

      await page.pdf({
        path: filePath,
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
      });

      logger.info(`🎯 PERFECTION: PDF Generated for ${applicationNo}`);
      return filePath;
    } catch (error: any) {
      logger.error(`PDF Fail: ${error.message}`);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
