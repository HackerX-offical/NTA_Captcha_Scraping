import { captchaImageUrl, loginUrl } from './urls';

describe('portal URLs', () => {
  test('loginUrl joins base and path', () => {
    expect(loginUrl()).toContain('examinationservices.nic.in');
    expect(loginUrl()).toContain('Login');
  });

  test('captchaImageUrl points at captcha endpoint', () => {
    expect(captchaImageUrl()).toContain('ShowCaptchaImage');
  });
});
