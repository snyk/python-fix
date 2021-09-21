import * as fs from 'fs';
import * as pathLib from 'path';

import * as snykChildProcess from '@snyk/child-process';

import { poetryAdd } from '../../src';

jest.mock('@snyk/child-process', () => ({
  ...jest.requireActual('@snyk/child-process'),
}));

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

describe('poetryAdd', () => {
  let filesToDelete: string[] = [];
  const workspacesPath = pathLib.resolve(__dirname, 'workspaces');
  const OLD_ENV = process.env;

  let poetryAddSpy: jest.SpyInstance;

  afterEach(() => {
    poetryAddSpy.mockRestore();
    filesToDelete.map((f) => fs.unlinkSync(f));
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  beforeEach(() => {
    poetryAddSpy = jest.spyOn(snykChildProcess, 'execute');
    process.env = { ...OLD_ENV }; // Make a copy
  });

  it('Fails to update any files when locking fails due to Python version requirements mismatch', async () => {
    // Arrange
    const targetFile = 'fails-to-lock/pyproject.toml';
    const expectedTargetFile = 'fails-to-lock/expected-pyproject.toml';

    const lockFile = 'fails-to-lock/poetry.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);

    // This version of Django no longer supports 2.7
    const packagesToInstall = ['django==2.*'];
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await poetryAdd(dir, packagesToInstall, {});
    // Assert
    expect(res).toEqual({
      command: 'poetry add django==2.*',
      duration: expect.any(Number),
      exitCode: 1,
      // depending on poetry version this may have some data
      // poetry 1.0.* is affected
      stderr: expect.any(String),
      stdout: expect.stringContaining('NoCompatiblePythonVersionFound'),
    });
    const fixedFileContent = fs.readFileSync(
      pathLib.join(workspacesPath, targetFile),
      'utf-8',
    );
    const expectedPyprojectContent = fs.readFileSync(
      pathLib.join(workspacesPath, expectedTargetFile),
      'utf-8',
    );
    expect(fixedFileContent).toEqual(expectedPyprojectContent);

    // verify versions in lockfiles
    const fixedLockfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, lockFile),
      'utf-8',
    );

    // lockfile still has original version
    expect(fixedLockfileContent).toContain('1.11.0');
    expect(poetryAddSpy).toBeCalledTimes(1);

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'fails-to-lock/pyproject.toml.orig'),
      pathLib.join(workspacesPath, 'fails-to-lock/poetry.lock.orig'),
    ];
  }, 90000);

  it('fails to apply expected changes to pyproject.toml when given an unreachable/non-existent package', async () => {
    // Arrange
    const targetFile = 'non-existent/pyproject.toml';
    const expectedTargetFile = 'non-existent/expected-pyproject.toml';

    const lockFile = 'non-existent/poetry.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['non-existent==1.16.16'];
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await poetryAdd(dir, packagesToInstall, {});

    // Assert
    expect(res).toEqual({
      command: 'poetry add non-existent==1.16.16',
      duration: expect.any(Number),
      exitCode: 1,
      stderr: expect.any(String),
      stdout: expect.stringContaining(
        'Could not find a matching version of package non-existent',
      ),
    });
    const fixedFileContent = fs.readFileSync(
      pathLib.join(workspacesPath, targetFile),
      'utf-8',
    );
    const expectedPyprojectContent = fs.readFileSync(
      pathLib.join(workspacesPath, expectedTargetFile),
      'utf-8',
    );
    expect(fixedFileContent).toEqual(expectedPyprojectContent);

    // verify versions in lockfiles
    const fixedLockfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, lockFile),
      'utf-8',
    );

    expect(poetryAddSpy).toBeCalledTimes(1);
    expect(fixedLockfileContent).not.toContain('1.16.16');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'non-existent/pyproject.toml.orig'),
      pathLib.join(workspacesPath, 'non-existent/poetry.lock.orig'),
    ];
  }, 90000);

  it('applies expected changes to pyproject.toml (100% success)', async () => {
    // Arrange
    const targetFile = 'simple/pyproject.toml';
    const expectedTargetFile = 'simple/expected-pyproject.toml';

    const lockFile = 'simple/poetry.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['six==1.16.0'];
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await poetryAdd(dir, packagesToInstall, {});
    // Assert
    expect(res).toEqual({
      command: 'poetry add six==1.16.0',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: expect.any(String),
      stdout: expect.stringContaining('Installing six'),
    });
    const fixedFileContent = fs.readFileSync(
      pathLib.join(workspacesPath, targetFile),
      'utf-8',
    );
    const expectedPyprojectContent = fs.readFileSync(
      pathLib.join(workspacesPath, expectedTargetFile),
      'utf-8',
    );
    expect(fixedFileContent).toEqual(expectedPyprojectContent);

    // verify versions in lockfiles
    const fixedLockfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, lockFile),
      'utf-8',
    );
    expect(poetryAddSpy).toBeCalledTimes(1);

    // lockfile still has original version
    expect(fixedLockfileContent).toContain('1.16.0');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'simple/pyproject.toml.orig'),
      pathLib.join(workspacesPath, 'simple/poetry.lock.orig'),
    ];
  }, 90000);
  it('applies expected changes to pyproject.toml (100% success) for a dev dependency', async () => {
    // Arrange
    const targetFile = 'with-dev-deps/pyproject.toml';
    const expectedTargetFile = 'with-dev-deps/expected-pyproject.toml';

    const lockFile = 'with-dev-deps/poetry.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['json-api==0.1.22'];
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await poetryAdd(dir, packagesToInstall, { dev: true });

    // Assert

    expect(res).toEqual({
      command: 'poetry add json-api==0.1.22 --dev',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: expect.any(String),
      stdout: expect.stringContaining('json-api'),
    });
    const fixedFileContent = fs.readFileSync(
      pathLib.join(workspacesPath, targetFile),
      'utf-8',
    );
    const expectedPyprojectContent = fs.readFileSync(
      pathLib.join(workspacesPath, expectedTargetFile),
      'utf-8',
    );
    expect(fixedFileContent).toEqual(expectedPyprojectContent);

    // verify versions in lockfiles
    const fixedLockfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, lockFile),
      'utf-8',
    );

    expect(poetryAddSpy).toBeCalledTimes(1);
    // lockfile still has original version
    expect(fixedLockfileContent).toContain('dev');
    expect(fixedLockfileContent).toContain('0.1.22');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'with-dev-deps/pyproject.toml.orig'),
      pathLib.join(workspacesPath, 'with-dev-deps/poetry.lock.orig'),
    ];
  }, 90000);

  it.todo('With a specific Python version');
  it.todo('With system markers Python version');

  it('applies expected changes to pyproject.toml (100% success) with python2', async () => {
    // Arrange
    const targetFile = 'with-interpreter/pyproject.toml';
    const expectedTargetFile = 'with-interpreter/expected-pyproject.toml';

    const lockFile = 'with-interpreter/poetry.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['pyasn1==0.4.8'];
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await poetryAdd(dir, packagesToInstall, { python: 'python2' });

    // Assert
    expect(res).toEqual({
      command: 'poetry add pyasn1==0.4.8',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: expect.any(String),
      stdout: expect.stringContaining('Installing pyasn1'),
    });
    const fixedFileContent = fs.readFileSync(
      pathLib.join(workspacesPath, targetFile),
      'utf-8',
    );
    const expectedPyprojectContent = fs.readFileSync(
      pathLib.join(workspacesPath, expectedTargetFile),
      'utf-8',
    );
    expect(fixedFileContent).toEqual(expectedPyprojectContent);

    // verify versions in lockfiles
    const fixedLockfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, lockFile),
      'utf-8',
    );

    expect(poetryAddSpy.mock.calls[0]).toEqual([
      'poetry',
      ['env', 'use', 'python2'],
      {
        cwd: pathLib.join(workspacesPath, 'with-interpreter'),
      },
    ]);
    expect(poetryAddSpy.mock.calls[2]).toEqual([
      'poetry',
      ['env', 'use', 'system'],
      {
        cwd: pathLib.join(workspacesPath, 'with-interpreter'),
      },
    ]);
    expect(poetryAddSpy).toBeCalledTimes(3);

    // lockfile still has original version
    expect(fixedLockfileContent).toContain('0.4.8');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'with-interpreter/pyproject.toml.orig'),
      pathLib.join(workspacesPath, 'with-interpreter/poetry.lock.orig'),
    ];
  }, 90000);
  it('Pins transitive dependencies (100% success)', async () => {
    // Arrange
    const targetFile = 'with-pins/pyproject.toml';
    const expectedTargetFile = 'with-pins/expected-pyproject.toml';

    const lockFile = 'with-pins/poetry.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    // pygments is a transitive of ipdb

    const packagesToInstall = ['future==0.11.1'];
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await poetryAdd(dir, packagesToInstall, {});

    // Assert
    expect(res).toEqual({
      command: 'poetry add future==0.11.1',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: expect.any(String),
      stdout: expect.stringContaining('future'),
    });
    const fixedFileContent = fs.readFileSync(
      pathLib.join(workspacesPath, targetFile),
      'utf-8',
    );
    const expectedPyprojectContent = fs.readFileSync(
      pathLib.join(workspacesPath, expectedTargetFile),
      'utf-8',
    );
    // some versions of Poetry add pygments and some add Pygments to the manifest
    expect(fixedFileContent.toLowerCase()).toEqual(
      expectedPyprojectContent.toLowerCase(),
    );

    // verify versions in lockfiles
    const fixedLockfileContent = fs.readFileSync(
      pathLib.join(workspacesPath, lockFile),
      'utf-8',
    );

    expect(fixedLockfileContent).toContain('0.11.1');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'with-pins/pyproject.toml.orig'),
      pathLib.join(workspacesPath, 'with-pins/poetry.lock.orig'),
    ];
  }, 120000);
});
