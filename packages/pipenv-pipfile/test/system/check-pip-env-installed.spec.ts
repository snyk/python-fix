import { isPipenvInstalled } from '../../src';

test('isPipenvInstalled', async () => {
  const res = await isPipenvInstalled();
  // version depends on test matrix
  /* eslint-disable no-console */
  console.log(`Jest test: pipenv version is ${res.version}`);
  expect(res.version).not.toBeNull();
});
