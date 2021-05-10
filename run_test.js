const child_process = require('child_process');

async function main() {
  if (!process.env.CIRCLE_PULL_REQUEST) {
    console.error('This script can only run from circle ci');
    process.exit(1);
  }
  const pkgsWithMatrix = ['@snyk-fix/pipenv-pipfile']; //, 'pipenv-pipfile'];

  // list of changed packages (their names, not their folder names)
  const changedPackages = run(`lerna changed --loglevel error`).split('\n');

  if (changedPackages.length === 0) {
    console.log('No packages to test');
    return;
  }

  console.log(`Running tests on: ${changedPackages.join()}`);
  const pkgsToTestWithLerna = changedPackages.filter(
    (pkgName) => !pkgsWithMatrix.includes(pkgName),
  );
  const pkgsToTestWithDifferentEnvs = changedPackages.filter((pkgName) =>
    pkgsWithMatrix.includes(pkgName),
  );

  const sha1 = process.env.CIRCLE_SHA1;
  for (const pkg of pkgsToTestWithDifferentEnvs) {
    run(`git tag -f test_${pkg}_${sha1}`);
  }
  run(
    `git push "https://git:$GH_TOKEN@github.com/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME" --tag`,
  );

  const whitelist = pkgsToTestWithLerna
    .map((pkgName) => `--scope ${pkgName}`)
    .join(' ');
  run(`lerna run test ${whitelist} --stream`);
}

main();

function run(cmd) {
  try {
    const result = child_process
      .execSync(cmd)
      .toString()
      .trim();
    console.log(`Result of "${cmd}";`);
    console.log(result);
    return result;
  } catch (e) {
    console.log(`Error running "${cmd}"`);
    console.log(JSON.stringify(e));
    throw e;
  }
}
