import * as fs from 'fs';
import * as pathLib from 'path';
import { pipenvInstall } from '../../src/';

function backupFiles(root: string, files: string[]): void {
  for (const file of files) {
    const fullPath = pathLib.join(root, file);
    fs.copyFileSync(fullPath, `${fullPath}.orig`);
  }
}

function restoreFiles(root: string, files: string[]): void {
  for (const file of files) {
    const orig = pathLib.join(root, `${file}.orig`);
    const restore = pathLib.join(root, file);
    fs.copyFileSync(orig, restore);
  }
}
describe('pipenvInstall', () => {
  let filesToDelete: string[] = [];
  const workspacesPath = pathLib.resolve(__dirname, 'workspaces');

  afterEach(() => {
    filesToDelete.map((f) => fs.unlinkSync(f));
  });
  it('applies expected changes to Pipfile when locking fails', async () => {
    // Arrange
    const targetFile = 'with-dev-deps/Pipfile';
    const expectedTargetFile = 'with-dev-deps/expected-Pipfile';

    const lockFile = 'with-dev-deps/Pipfile.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['django==2.0.1', 'transitive==1.1.1'];
    const config = {};

    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    await pipenvInstall(dir, packagesToInstall, config);
    // Assert
    // expect the updated file to match exactly expected file
    const fixedFileContent = fs.readFileSync(
      pathLib.join(workspacesPath, targetFile),
      'utf-8',
    );
    const expectedPipfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, expectedTargetFile),
      'utf-8',
    );
    expect(fixedFileContent).toEqual(expectedPipfileContent);

    // verify versions in lockfiles
    const fixedLockfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, lockFile),
      'utf-8',
    );

    const pipfileLockJson = JSON.parse(fixedLockfileContent);

    // lockfile still has original version
    expect(pipfileLockJson.default.django.version).toEqual('==1.6.1');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'with-dev-deps/Pipfile.orig'),
      pathLib.join(workspacesPath, 'with-dev-deps/Pipfile.lock.orig'),
    ];
  }, 70000);

  // it('applies expected changes to Pipfile (100% success)', async () => {
  //   // Arrange
  //   const targetFile = 'with-django-upgrade/Pipfile';
  //   const expectedTargetFile = 'with-django-upgrade/expected-Pipfile';

  //   const lockFile = 'with-django-upgrade/Pipfile.lock';
  //   // backup original files
  //   backupFiles(workspacesPath, [targetFile, lockFile]);
  //   const testResult = {
  //     ...generateTestResult(),
  //     remediation: {
  //       unresolved: [],
  //       upgrade: {},
  //       patch: {},
  //       ignore: {},
  //       pin: {
  //         'django@1.6.1': {
  //           upgradeTo: 'django@2.0.1',
  //           vulns: [],
  //           isTransitive: false,
  //         },
  //       },
  //     },
  //   };

  //   const entityToFix = generateEntityToFix(
  //     workspacesPath,
  //     targetFile,
  //     testResult,
  //   );

  //   // Act
  //   const result = await snykFix.fix([entityToFix], {
  //     quiet: true,
  //     // stripAnsi: true,
  //   });
  //   // Assert
  //   // expect the updated file to match exactly expected file
  //   const fixedFileContent = fs.readFileSync(
  //     pathLib.join(workspacesPath, targetFile),
  //     'utf-8',
  //   );
  //   const expectedPipfileContent = fs.readFileSync(
  //     pathLib.join(workspacesPath, expectedTargetFile),
  //     'utf-8',
  //   );
  //   expect(fixedFileContent).toEqual(expectedPipfileContent);

  //   // verify versions in lockfiles
  //   const fixedLockfileContent = fs.readFileSync(
  //     pathLib.join(workspacesPath, lockFile),
  //     'utf-8',
  //   );

  //   const pipfileLockJson = JSON.parse(fixedLockfileContent);

  //   // lockfile still has original version
  //   expect(pipfileLockJson.default.django.version).toEqual('==2.0.1');

  //   expect(result).toMatchObject({
  //     exceptions: {},
  //     results: {
  //       python: {
  //         failed: [],
  //         skipped: [],
  //         succeeded: [
  //           {
  //             original: entityToFix,
  //             changes: [
  //               {
  //                 success: true,
  //                 userMessage: 'Upgraded django from 1.6.1 to 2.0.1',
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     },
  //   });

  //   // restore original files
  //   restoreFiles(workspacesPath, [targetFile, lockFile]);
  //   filesToDelete = [
  //     pathLib.join(workspacesPath, 'with-django-upgrade/Pipfile.orig'),
  //     pathLib.join(workspacesPath, 'with-django-upgrade/Pipfile.lock.orig'),
  //   ];
  // }, 90000);

  it.todo(
    'Uses provided python interpreter if --command was used for test/fix',
  );
});
