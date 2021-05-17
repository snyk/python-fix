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

  // TODO: can dev-deps actually be updated/scanned via CLI today?
  it('applies expected changes to Pipfile when locking fails', async () => {
    // Arrange
    const targetFile = 'with-dev-deps/Pipfile';
    const lockFile = 'with-dev-deps/Pipfile.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['Jinja2==2.11.2', 'transitive==1.1.1'];
    const config = {};
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await pipenvInstall(dir, packagesToInstall, config);
    // Assert
    // expect the updated file to match exactly expected file
    expect(res).toEqual({
      command: 'pipenv install Jinja2==2.11.2 transitive==1.1.1',
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
    expect(fixedFileContent).toContain('Jinja2 = "==2.11.2"');

    // verify versions in lockfiles
    const fixedLockfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, lockFile),
      'utf-8',
    );

    const pipfileLockJson = JSON.parse(fixedLockfileContent);

    // lockfile still has original version
    expect(pipfileLockJson.default.jinja2.version).toEqual('==2.11.0');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'with-dev-deps/Pipfile.orig'),
      pathLib.join(workspacesPath, 'with-dev-deps/Pipfile.lock.orig'),
    ];
  }, 70000);

  it('applies expected changes to Pipfile (100% success) with required python version --python', async () => {
    // Arrange
    const targetFile = 'with-django-upgrade/Pipfile';
    const expectedTargetFile = 'with-django-upgrade/expected-Pipfile';

    const lockFile = 'with-django-upgrade/Pipfile.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['django==2.0.2'];
    const config = {
      python: '3.8.1',
    };
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await pipenvInstall(dir, packagesToInstall, config);

    // Assert
    // expect the updated file to match exactly expected file
    expect(res).toEqual({
      command: 'pipenv install django==2.0.2 --python 3.8.1',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: expect.stringContaining('Adding django'),
      stdout: expect.stringContaining('Installing django==2.0.2'),
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
    expect(pipfileLockJson.default.django.version).toEqual('==2.0.2');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'with-django-upgrade/Pipfile.orig'),
      pathLib.join(workspacesPath, 'with-django-upgrade/Pipfile.lock.orig'),
    ];
  }, 90000);

  it('Uses correct provided python if project requires it', async () => {
    // Arrange
    const targetFile = 'with-non-default-python-version/Pipfile';
    const expectedTargetFile =
      'with-non-default-python-version/expected-Pipfile';

    const lockFile = 'with-non-default-python-version/Pipfile.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['django==3.1.3'];
    const config = {};

    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await pipenvInstall(dir, packagesToInstall, config);

    // Assert
    // expect the updated file to match exactly expected file
    expect(res).toEqual({
      command: 'pipenv install django==3.1.3',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: expect.stringContaining('Adding django to Pipfile'),
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

  it.todo('With a dev dep that needs updating');
});
