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
- `npm install`
- `npx lerna bootstrap`

### Running tests
`lerna test`

### Running individual package tests
`lerna run test --scope <package_name_from_package_json> --stream`

### Upgrading dependencies

Simplest way is to use global `npm-check-updates` package to update package.json.

```
npx lerna exec -- npx npm-check-updates -u
npx lerna exec -- npm install
```

### CircleCI Configuration

We use CircleCI to run our continuous integration pipeline for the repository. Certain jobs require write permissions to push tags back to the GitHub org, permissions are managed via a read/write deploy key managed under the project settings in CircleCI. The credentials for the account can be found in 1Password under the `snyk/python-fix deploy key` entry.

The GH_TOKEN and NPM_TOKEN environment variables are also provided via the `snyk/python-fix/circleci` CircleCI context. Details for these can be found under the `team-fix@snyk.io` entry in 1Password. 
