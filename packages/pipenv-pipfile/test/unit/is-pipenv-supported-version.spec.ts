import { isPipenvSupportedVersion } from '../../src/is-pipenv-supported-version';

describe('extractPipenvVersion', () => {
  it('2018.11.26 is supported', async () => {
    const { supported, versions } = isPipenvSupportedVersion('2018.11.26');
    expect(supported).toBeTruthy();
    expect(versions).toEqual([
      '2022.10.12',
      '2022.9.21',
      '2022.8.31',
      '2022.7.24',
      '2022.6.7',
      '2022.5.2',
      '2022.4.21',
      '2021.11.23',
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
    const { supported } = isPipenvSupportedVersion('unknown');
    expect(supported).toBeFalsy();
  });
});
