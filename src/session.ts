import axios from "axios";
import https from "https";
import { createWorker, Worker } from "tesseract.js";
import { CONFIG, HEADERS } from "./config";
import { SessionData } from "./types";
import { logger } from "./logger";

export class SessionManager {
  private currentSession: SessionData | null = null;
  private ocrWorker: Worker | null = null;
  private refreshPromise: Promise<SessionData | null> | null = null;
  private agent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
  });

  private async getWorker() {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker("eng");
    }
    return this.ocrWorker;
  }

  private async solveCaptcha(imageBuffer: Buffer): Promise<string> {
    const worker = await this.getWorker();
    try {
      const {
        data: { text },
      } = await worker.recognize(imageBuffer);
      return text.replace(/[^A-Z0-9]/gi, "").substring(0, 6);
    } catch (error: any) {
      logger.error(`OCR Error: ${error.message}`);
      return "XXXXXX";
    }
  }

  async getSession(forceRefresh = false): Promise<SessionData | null> {
    const REUSE_LIMIT = 5000;

    // Return existing session if valid
    if (
      !forceRefresh &&
      this.currentSession &&
      this.currentSession.usageCount < REUSE_LIMIT
    ) {
      this.currentSession.usageCount++;
      return this.currentSession;
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start a new refresh and lock it
    this.refreshPromise = (async () => {
      try {
        const config1: any = {
          httpsAgent: this.agent,
          headers: HEADERS,
          timeout: 10000,
        };
        const loginPage = await axios.get(
          `${CONFIG.baseUrl}${CONFIG.loginPath}`,
          config1,
        );
        const cookies =
          (loginPage.headers["set-cookie"] as string[])?.join("; ") || "";

        const saltMatch = String(loginPage.data).match(
          /AdminLogin_ValidatorFun\((?:&#39;|'|")([^&'"]+)(?:&#39;|'|")\)/,
        );
        const salt = saltMatch ? saltMatch[1] : "";

        const captchaRes = await axios.get(
          `${CONFIG.baseUrl}${CONFIG.captchaPath}`,
          {
            httpsAgent: this.agent,
            headers: { ...HEADERS, Cookie: cookies },
            responseType: "arraybuffer",
            timeout: 10000,
          },
        );

        const solvedCaptcha = await this.solveCaptcha(
          Buffer.from(captchaRes.data),
        );

        this.currentSession = {
          cookies,
          captcha: solvedCaptcha,
          salt,
          usageCount: 0,
        };

        logger.info(
          `🚨 SESSION RENEWED [Salt: ${salt} | Captcha: ${solvedCaptcha}]`,
        );
        return this.currentSession;
      } catch (error: any) {
        logger.error(`Session Renewal Failed: ${error.message}`);
        this.currentSession = null;
        return null;
      } finally {
        this.refreshPromise = null; // Unlock
      }
    })();

    return this.refreshPromise;
  }

  get currentCaptchaValue(): string {
    return this.currentSession?.captcha || "";
  }
}
