import * as fs from 'fs';
import * as pathLib from 'path';
import { poetryAdd } from '../../src';

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

  afterEach(() => {
    filesToDelete.map((f) => fs.unlinkSync(f));
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  beforeEach(() => {
    process.env = { ...OLD_ENV }; // Make a copy
  });

  it.todo('applies expected changes to pyproject.toml when locking fails');

  it('applies expected changes to pyproject.toml (100% success) with required python version', async () => {
    // Arrange
    const targetFile = 'simple/pyproject.toml';
    const expectedTargetFile = 'simple/expected-pyproject.toml';

    const lockFile = 'simple/poetry.lock';
    // backup original files
    backupFiles(workspacesPath, [targetFile, lockFile]);
    const packagesToInstall = ['six==1.16.0'];
    // Act
    const { dir } = pathLib.parse(pathLib.resolve(workspacesPath, targetFile));
    const res = await poetryAdd(dir, packagesToInstall);

    // Assert
    // expect the updated file to match exactly expected file
    expect(res).toEqual({
      command: 'poetry add six==1.16.0',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: '',
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

    // lockfile still has original version
    expect(fixedLockfileContent).toContain('1.16.0');

    // restore original files
    restoreFiles(workspacesPath, [targetFile, lockFile]);
    filesToDelete = [
      pathLib.join(workspacesPath, 'simple/pyproject.toml.orig'),
      pathLib.join(workspacesPath, 'simple/poetry.lock.orig'),
    ];
  }, 90000);

  it.todo('With a dev dep that needs updating');
});
