import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {defineConfig} from 'vitest/config';

const require = createRequire(import.meta.url);
const typeormV0Dir = dirname(require.resolve('typeorm-v0'));
const typeormV1Dir = dirname(require.resolve('typeorm-v1'));

function typeormAlias(typeormDir: string) {
  return [
    {find: /^typeorm$/, replacement: typeormDir},
    {find: /^typeorm\/(.*)$/, replacement: join(typeormDir, '$1')},
  ];
}

export default defineConfig({
  test: {
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/vitest-junit.xml',
    },
    projects: [
      {
        test: {
          name: 'typeorm-0.x',
          include: ['test/common/**/*.test.ts', 'test/v0.x/**/*.test.ts'],
          testTimeout: 60000,
        },
        resolve: {
          alias: typeormAlias(typeormV0Dir),
        },
      },
      {
        test: {
          name: 'typeorm-1.x',
          include: ['test/common/**/*.test.ts', 'test/v1.x/**/*.test.ts'],
          testTimeout: 60000,
        },
        resolve: {
          alias: typeormAlias(typeormV1Dir),
        },
      },
    ],
  },
});
