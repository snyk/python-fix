import { execute } from '../../src/child-process';

describe('execute', () => {
  it('returns all data when command succeeds', async () => {
    const res = await execute('node', ['-h'], {});
    expect(res).toEqual({
      command: 'node -h',
      duration: expect.any(Number),
      exitCode: 0,
      stderr: '',
      stdout: expect.stringMatching('Documentation can be found at'),
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
    const res = await execute('node', ['--python', '1.2.3'], {});
    // created while running the above command that fails
    expect(res).toEqual({
      command: 'node --python 1.2.3',
      duration: expect.any(Number),
      exitCode: expect.any(Number),
      stderr: expect.stringContaining('node: bad option: --python'),
      stdout: '',
    });
  }, 30000);
});
