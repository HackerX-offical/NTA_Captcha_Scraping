import { CONFIG } from './config';

export function loginUrl(): string {
  return `${CONFIG.baseUrl}${CONFIG.loginPath}`;
}

export function captchaImageUrl(): string {
  return `${CONFIG.baseUrl}${CONFIG.captchaPath}`;
}
