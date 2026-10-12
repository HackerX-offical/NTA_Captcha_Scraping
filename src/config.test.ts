import { CONFIG, HEADERS } from './config';

describe('CONFIG', () => {
  test('defines output directories', () => {
    expect(CONFIG.outputDir).toBe('./results');
    expect(CONFIG.pdfDir).toContain('pdf');
  });

  test('HEADERS include user agent', () => {
    expect(HEADERS['User-Agent']).toContain('Chrome');
  });
});
