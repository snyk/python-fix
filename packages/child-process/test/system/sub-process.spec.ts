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

  it('restores any HTTP_PROXY related environment variables', async () => {
    // Other Env
    process.env.MY_ENV_VAR = 'hello world';

    // Snyk CLI Settings
    process.env.NO_PROXY = '';
    process.env.HTTP_PROXY = 'http://snyk-proxy:8080';
    process.env.HTTPS_PROXY = 'https://snyk-proxy:8080';

    // User Defaults
    process.env.SNYK_SYSTEM_NO_PROXY =
      'internal.example.com,internal2.example.com';
    process.env.SNYK_SYSTEM_HTTP_PROXY = 'http://my-org-proxy:8080';
    process.env.SNYK_SYSTEM_HTTPS_PROXY = 'https://my-org-proxy:8080';

    const res = await execute(
      'node',
      ['-pe', 'JSON.stringify(process.env)'],
      {},
    );
    expect(res).toEqual({
      command: expect.any(String),
      duration: expect.any(Number),
      exitCode: 0,
      stderr: '',
      stdout: expect.any(String),
    });

    const env = JSON.parse(res.stdout);
    expect(env.NO_PROXY).toEqual('internal.example.com,internal2.example.com');
    expect(env.HTTP_PROXY).toEqual('http://my-org-proxy:8080');
    expect(env.HTTPS_PROXY).toEqual('https://my-org-proxy:8080');
    expect(env.MY_ENV_VAR).toEqual('hello world');
  });
});
