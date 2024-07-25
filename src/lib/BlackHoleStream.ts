import { Writable } from 'stream';

export default class BlackHoleStream extends Writable {
  _write(_chunk: any, _encoding: any, callback: (error?: Error | null) => void) {
    // Ignore the chunk and call the callback to signal that writing is complete
    setImmediate(callback);
  }
}
