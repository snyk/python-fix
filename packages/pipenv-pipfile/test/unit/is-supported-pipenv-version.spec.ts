import { isSupportedPipenvVersion } from '../../src/supported-pipenv-version';

describe('extractPipenvVersion', () => {
  it('2018.11.26 is supported', async () => {
    const { supported, versions } = isSupportedPipenvVersion('2018.11.26');
    expect(supported).toBeTruthy();
    expect(versions).toEqual([
      '2020.11.4',
      '2020.8.13',
      '2020.6.2',
      '2020.5.28',
      '2018.11.26',
      '2018.11.14',
      '2018.10.13',
      '2018.10.9',
      '2018.7.1',
      '2018.6.25',
    ]);
  });
  it('unknown version is not supported', async () => {
    const { supported } = isSupportedPipenvVersion('unknown');
    expect(supported).toBeFalsy();
  });
});
