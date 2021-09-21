import { isPoetrySupportedVersion } from '../../src/is-poetry-supported-version';

describe('isPoetrySupportedVersion', () => {
  it('1.1.6 is supported', async () => {
    const { supported, versions } = isPoetrySupportedVersion('1.1.6');
    expect(supported).toBeTruthy();
    expect(versions).toEqual([
      '1.1.9',
      '1.1.8',
      '1.1.7',
      '1.1.6',
      '1.1.5',
      '1.1.4',
      '1.0.9',
      '1.0.8',
      '1.0.7',
    ]);
  });
  it('unknown version is not supported', async () => {
    const { supported } = isPoetrySupportedVersion('unknown');
    expect(supported).toBeFalsy();
  });
});
