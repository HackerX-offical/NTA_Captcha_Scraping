export interface ScraperConfig {
  baseUrl: string;
  loginPath: string;
  captchaPath: string;
  concurrency: number;
  captchaReuseLimit: number;
  outputDir: string;
  pdfDir: string;
}

export interface AuthResult {
  success: boolean;
  html?: string;
  applicationNo: string;
  password: string;
  error?: string;
}

export interface SessionData {
  cookies: string;
  captcha: string;
  salt: string;
  usageCount: number;
}
