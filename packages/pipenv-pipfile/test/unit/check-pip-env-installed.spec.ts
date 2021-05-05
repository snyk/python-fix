import { extractPipenvVersion } from '../../src/check-pip-env-installed';

describe('extractPipenvVersion', () => {
  it('extracts version from stdout', async () => {
    const res = await extractPipenvVersion('pipenv, version 2018.11.26\n');
    expect(res).toEqual('2018.11.26');
  });
  it('Fails with invalid input', async () => {
    const res = await extractPipenvVersion('pipenv: command not found');
    expect(res).toBeNull();
  });
});
