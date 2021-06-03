const child_process = require('child_process');

async function main() {
  if (!process.env.CIRCLE_SHA1) {
    console.error('This script can only run from circle ci');
    process.exit(1);
  }
  const pkgsWithMatrix = [
    '@snyk/fix-pipenv-pipfile',
    '@snyk/fix-pip-requirements',
    '@snyk/child-process',
    '@snyk/fix-poetry',
  ];

  // list of changed packages (their names, not their folder names)
  const changedPackages = JSON.parse(
    run(`lerna changed --loglevel error --json || echo []`),
  ).map((pkg) => pkg.name);

  if (changedPackages.length === 0) {
    console.log('No packages to test');
    return;
  }

  console.log(`Running tests on: ${changedPackages.join(', ')}`);
  const pkgsToTestWithDifferentEnvs = changedPackages.filter((pkgName) =>
    pkgsWithMatrix.includes(pkgName),
  );

  const pkgsNotCovered = changedPackages.filter(
    (pkgName) => !pkgsToTestWithDifferentEnvs.includes(pkgName),
  );

  if (pkgsNotCovered.length > 0) {
    console.error(
      `These changed packages did not have tests assigned: ${pkgsNotCovered.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }

  const sha1 = process.env.CIRCLE_SHA1;
  for (const pkg of pkgsToTestWithDifferentEnvs) {
    run(`git tag -f test_${pkg}_${sha1}`);
  }
  run(`git push --tag`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

function run(cmd) {
  console.log(`Running "${cmd}":`);
  const result = child_process
    .execSync(cmd, { encoding: 'utf-8' })
    .toString()
    .trim();
  console.log(result);
  return result;
}
