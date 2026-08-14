import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 60000,
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/vitest-junit.xml',
    },
  },
});
