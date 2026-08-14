import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {defineConfig} from 'vitest/config';

const require = createRequire(import.meta.url);
const typeormV0Dir = dirname(require.resolve('typeorm-v0'));

export default defineConfig({
  resolve: {
    alias: [
      {find: /^typeorm$/, replacement: typeormV0Dir},
      {find: /^typeorm\/(.*)$/, replacement: join(typeormV0Dir, '$1')},
    ],
  },
  test: {
    testTimeout: 60000,
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/vitest-junit.xml',
    },
  },
});
