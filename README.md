![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)

***
Snyk finds, fixes and monitors your dependencies for known vulnerabilities. Both on an ad hoc basis and as part of your CI (Build) system.

# Snyk Python Fix
Snyk ecosystem fix remediation strategies used with [Snyk CLI](https://github.com/snyk/snyk) to automatically apply recommended issue fixes.

## Table of Contents
- [Development setup](#development-setup)

- Python Support
  - [Pipfile (pipenv)](packages/pipenv-pipfile/SUPPORTED.md)
  - [Poetry](packages/poetry/SUPPORTED.md)


## Development setup
- `npm i`
- `lerna bootstrap`

### Running tests
`lerna test`

### Running individual package tests
`lerna run test --scope <package_name_from_package_json> --stream`
