const { escapeRegex } = require('../src/utils/helpers');

describe('escapeRegex', () => {
  test('escapes special regex characters', () => {
    expect(escapeRegex('test.com')).toBe('test\\.com');
    expect(escapeRegex('a+b*c')).toBe('a\\+b\\*c');
    expect(escapeRegex('(foo)[bar]')).toBe('\\(foo\\)\\[bar\\]');
  });

  test('returns plain strings unchanged', () => {
    expect(escapeRegex('hello')).toBe('hello');
    expect(escapeRegex('GlowFlow')).toBe('GlowFlow');
  });

  test('handles empty string', () => {
    expect(escapeRegex('')).toBe('');
  });

  test('escapes dollar sign and curly braces', () => {
    expect(escapeRegex('${variable}')).toBe('\\$\\{variable\\}');
  });
});
