import {PassThrough, type TransformOptions} from 'node:stream';
import {vi} from 'vitest';

export function createMockStream(options?: TransformOptions): PassThrough & {clearMock: () => void} {
  const stream = new PassThrough(options);
  vi.spyOn(stream, 'write');

  return Object.assign(stream, {
    clearMock() {
      vi.mocked(stream.write).mockClear();
    },
  });
}
