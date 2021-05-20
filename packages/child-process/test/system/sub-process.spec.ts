import * as fs from 'fs';
import { execute } from '../../src/child-process';

describe('execute', () => {
  let filesToDelete: string[] = [];
  afterEach(() => {
    filesToDelete.map((f) => fs.unlinkSync(f));
  });
  it('returns all data when command succeeds', async () => {
    const res = await execute('node', ['--version'], {});
    expect(res).toEqual({
      command: 'node --version',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: '',
      stdout: expect.stringMatching('pipenv, version'),
    });
  });

  it('returns all error data when command fails', async () => {
    expect(execute('bad-command', ['--version'], {})).rejects.toMatchObject({
      command: 'bad-command --version',
      duration: expect.any(Number),
      error: expect.anything(),
      stderr: '',
      stdout: '',
    });
  });
  it('returns all stderr data when command is invalid', async () => {
    const res = await execute('pipenv', ['--python', '1.2.3'], {});
    // created while running the above command that fails
    filesToDelete = ['Pipfile'];
    expect(res).toEqual({
      command: 'pipenv --python 1.2.3',
      duration: expect.any(Number),
      exitCode: expect.any(Number),
      stderr: expect.stringContaining(
        'Warning: Python 1.2.3 was not found on your system',
      ),
      stdout: '',
    });
  }, 30000);
});
