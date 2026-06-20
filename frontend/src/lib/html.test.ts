import { describe, it, expect } from 'vitest';
import { htmlToText } from './html';

describe('htmlToText', () => {
  it('스크립트/태그를 제거(XSS 차단)', () => {
    expect(htmlToText('<img src=x onerror=alert(1)>')).toBe('');
    expect(htmlToText('<script>alert(1)</script>안녕')).toBe('alert(1)안녕');
    expect(htmlToText('<b>굵게</b>')).toBe('굵게');
  });
  it('br·블록 닫는 태그는 개행으로 보존', () => {
    expect(htmlToText('1줄<br>2줄')).toBe('1줄\n2줄');
    expect(htmlToText('<p>가</p><p>나</p>')).toBe('가\n나');
  });
  it('HTML 엔티티 디코드', () => {
    expect(htmlToText('a&amp;b')).toBe('a&b');
    expect(htmlToText('&lt;tag&gt;')).toBe('<tag>');
    expect(htmlToText('&#39;따옴표&#39;')).toBe("'따옴표'");
    expect(htmlToText('A&nbsp;B')).toBe('A B');
  });
  it('과다 빈 줄 축소 + trim', () => {
    expect(htmlToText('<p>가</p><br><br><br><p>나</p>')).toBe('가\n\n나');
  });
  it('null/빈값 안전', () => {
    expect(htmlToText(null)).toBe('');
    expect(htmlToText(undefined)).toBe('');
    expect(htmlToText('')).toBe('');
  });
});
