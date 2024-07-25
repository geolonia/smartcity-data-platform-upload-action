import iconv from 'iconv-lite';
import jschardet from 'jschardet';

export class UnsupportedEncodingError extends Error {
  constructor(detectedEncoding: string) {
    super(`Unsupported encoding: ${detectedEncoding}`);
    this.name = 'UnsupportedEncodingError';
  }
}

export default function detectAndDecode(content: Buffer): string {
  const detectedEncoding = jschardet.detect(content).encoding;
  if (detectedEncoding === 'SHIFT_JIS') {
    return iconv.decode(content, 'Shift_JIS');
  }

  // UTF-8 と判定された場合はそのまま返す
  if (detectedEncoding === 'UTF-8' || detectedEncoding === 'ascii') {
    return content.toString('utf8');
  }

  throw new UnsupportedEncodingError(detectedEncoding);
}
