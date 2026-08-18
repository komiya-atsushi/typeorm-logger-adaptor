#!/usr/bin/env bash

set -Eeuo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "${script_dir}/../.."

npm -w packages/typeorm-logger-adaptor run build
npm -w packages/typeorm-logger-adaptor pack --pack-destination packages/package-import-test

cd packages/package-import-test

for typeorm_version in '^0.3.31' '^1.1.0'; do
  echo "===== Testing with typeorm@${typeorm_version} ====="
  export TYPEORM_VERSION="${typeorm_version}"
  docker compose up -d mysql-service
  docker compose build test-app
  docker compose run --rm test-app
  docker compose down
done
