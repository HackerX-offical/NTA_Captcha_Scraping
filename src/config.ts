import { ScraperConfig } from "./types";
import os from "os";

export const CONFIG: ScraperConfig = {
  baseUrl: "https://examinationservices.nic.in",
  loginPath: "/ResultoService26/JE26S1P1/Login",
  captchaPath: "/ResultoService26/JE26S1P1/ShowCaptchaImage",
  concurrency: os.cpus().length * 4, // Aggressive concurrency
  captchaReuseLimit: 50,
  outputDir: "./results",
  pdfDir: "./results/pdfs",
};

export const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "Content-Type": "application/x-www-form-urlencoded",
};
