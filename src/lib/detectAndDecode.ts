import iconv from 'iconv-lite';
import jschardet from 'jschardet';

export default function detectAndDecode(content: Buffer): string | false {
  const detectedEncoding = jschardet.detect(content).encoding;
  if (detectedEncoding === 'SHIFT_JIS') {
    return iconv.decode(content, 'Shift_JIS');
  }

  // UTF-8 と判定された場合はそのまま返す
  if (detectedEncoding === 'UTF-8' || detectedEncoding === 'ascii') {
    return content.toString('utf8');
  }

  return false;
}
