import { extractPoetryVersion } from '../../src/check-poetry-is-installed';

describe('extractPipenvVersion', () => {
  it('extracts version from stdout', async () => {
    const res = await extractPoetryVersion('Poetry version 1.1.6');
    expect(res).toEqual('1.1.6');
  });
  it('Fails with invalid input', async () => {
    const res = await extractPoetryVersion('poetry: command not found');
    expect(res).toBeNull();
  });
});
