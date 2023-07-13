![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)

***
Snyk finds, fixes and monitors your dependencies for known vulnerabilities.
Both on an ad hoc basis and as part of your CI (Build) system.

# Snyk Python Fix
Snyk ecosystem fix remediation strategies used with [Snyk
CLI](https://github.com/snyk/snyk) to automatically apply recommended issue
fixes.

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

### CircleCI Matrix

The CircleCI test suite aims to test the library across a broad a compatibility
set as possible.

1. NodeJS versions from 12 up (supported by the Snyk CLI)
2. Python versions
3. Package manager versions e.g. pipenv, poetry etc.

See SUPPORTED.md or .circleci/config.yml for more details on specific versions.

#### Conditional Tests

We use the `lerna changed` command to only run tests if the changes will impact
a given package. This reduces the load and test time.

#### Node Support

In order to run these tests we need to ensure that our test suite runs on
NodeJS 12 and above. In order to do this we:

1. Compile the library and test code down to JavaScript in the ci/dist
   directory. This allows us to keep using the latest packages and node
   versions for our tooling e.g. lerna and typescript.
2. Pin Jest at v28 which is the last version to support node 12. Once we drop
   support for 12 in the Snyk CLI we can remove this restriction.

The CI Workflow then is as follows for each package and combination of Node,
Python, Package Manager:

0. Determine if the package is affected by the changes.
1. Using a recent nodejs image, we install dependencies and compile the source
   and test codebase into the ci/dist directory using the config in the ci
   directory for the package via `npm run ci:build`
2. Use nvm to switch to the appropriate node version.
2. Run the test suite using Jest via `npm run ci:test`


For faster local development each package still supports running `npm run test`
which will use ts-jest and transpile the TypeScript into JavaScript on the fly.

### CircleCI Configuration

We use CircleCI to run our continuous integration pipeline for the repository.
Certain jobs require write permissions to push tags back to the GitHub org,
permissions are managed via a read/write deploy key managed under the project
settings in CircleCI. The credentials for the account can be found in 1Password
under the `snyk/python-fix deploy key` entry.

The GH_TOKEN and NPM_TOKEN environment variables are also provided via the
`snyk/python-fix/circleci` CircleCI context. Details for these can be found
under the `team-fix@snyk.io` entry in 1Password. 
