import type {LoggerOptions} from 'typeorm/logger/LoggerOptions';

export const allLoggerOptions: LoggerOptions[] = [
  true,
  false,
  'all',
  ['query'],
  ['schema'],
  ['error'],
  ['warn'],
  ['info'],
  ['log'],
  ['migration'],
];

export function otherLoggerOptions(optionsToExclude: LoggerOptions[]): LoggerOptions[] {
  const set = new Set(optionsToExclude.map((elem) => elem.toString()));
  return allLoggerOptions.filter((opt) => !set.has(opt.toString()));
}
