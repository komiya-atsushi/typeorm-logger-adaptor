module.exports = {
  preset: 'ts-jest/presets/default',
  testTimeout: 60000,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'jest-junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
};
