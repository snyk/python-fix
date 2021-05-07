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
    const res = await pipenvInstall(dir, packagesToInstall, config);
    // Assert
    // expect the updated file to match exactly expected file
    expect(res).toEqual({
      command: 'pipenv install django==2.0.1 transitive==1.1.1',
      duration: expect.any(Number),
      exitCode: 1,
      stderr: expect.stringContaining(
        'No matching distribution found for transitive==1.1.1',
      ),
      stdout: expect.stringContaining('Installing transitive==1.1.1'),
    });
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

  it('applies expected changes to Pipfile (100% success)', async () => {
    // Arrange
    const targetFile = 'with-django-upgrade/Pipfile';
    const expectedTargetFile = 'with-django-upgrade/expected-Pipfile';

    const lockFile = 'with-django-upgrade/Pipfile.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['django==2.0.1'];
    const config = {};

    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await pipenvInstall(dir, packagesToInstall, config);

    // Assert
    // expect the updated file to match exactly expected file
    expect(res).toEqual({
      command: 'pipenv install django==2.0.1',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: expect.stringContaining('Updated Pipfile.lock'),
      stdout: expect.stringContaining('Installing django==2.0.1'),
    });
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
    expect(pipfileLockJson.default.django.version).toEqual('==2.0.1');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'with-django-upgrade/Pipfile.orig'),
      pathLib.join(workspacesPath, 'with-django-upgrade/Pipfile.lock.orig'),
    ];
  }, 90000);

  it('Uses provided python version if --command param is present 3.8.1', async () => {
    // Arrange
    const targetFile = 'with-non-default-python-version/Pipfile';
    const expectedTargetFile =
      'with-non-default-python-version/expected-Pipfile';

    const lockFile = 'with-non-default-python-version/Pipfile.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['django==3.1.3'];
    const config = {
      python: '3.8.1',
    };

    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await pipenvInstall(dir, packagesToInstall, config);

    // Assert
    // expect the updated file to match exactly expected file
    expect(res).toEqual({
      command: 'pipenv install django==3.1.3 --python 3.8.1',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: expect.stringContaining('Updated Pipfile.lock'),
      stdout: expect.stringContaining('Installing django==3.1.3'),
    });
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
    expect(pipfileLockJson.default.django.version).toEqual('==3.1.3');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(
        workspacesPath,
        'with-non-default-python-version/Pipfile.orig',
      ),
      pathLib.join(
        workspacesPath,
        'with-non-default-python-version/Pipfile.lock.orig',
      ),
    ];
  }, 90000);
});
