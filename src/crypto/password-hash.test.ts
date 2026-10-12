import { encryptPortalPassword } from './password-hash';

describe('encryptPortalPassword', () => {
  test('is deterministic for fixed salt', () => {
    const a = encryptPortalPassword('01012000', 'SALT');
    const b = encryptPortalPassword('01012000', 'SALT');
    expect(a).toBe(b);
    expect(a).toMatch(/^[A-F0-9]{64}$/);
  });

  test('changes when salt changes', () => {
    const a = encryptPortalPassword('pw', 'A');
    const b = encryptPortalPassword('pw', 'B');
    expect(a).not.toBe(b);
  });
});
