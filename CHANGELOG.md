# Changelog

## v1.3.1 / 2026-08-20

- Mark the logger peer dependencies (bunyan and winston) as optional, so that npm no longer installs unused logger libraries automatically.

## v1.3.0 / 2026-08-18

- Support TypeORM 1.x. The `typeorm` peer dependency is now `^0.2.0 || ^0.3.0 || ^1.0.0`.
- Format object-style query parameters in query logs.
- Add options object form to the adaptor constructors, with a new `formatSql` option to pretty-print SQL statements. The conventional positional arguments are deprecated.
- Run tests against both TypeORM 0.3.x and 1.x.

## v1.2.0 / 2024-11-09

- *No functional changes in production code.*
- Introduce npm workspaces.
- Introduce gts for linting and formatting.
- Reduce devDependencies.
- Stop using Gulp for packaging.

## v1.1.0 / 2022-03-24

- Bump typeorm dependency to ^0.3.0 to support new breaking version
- Update tests to match changes

## v1.0.4 / 2021-09-03

- [WinstonAdaptor] Call 'warning' logger method when syslog levels are used.

## v1.0.3 / 2021-01-04

- Initial release.
