import { isPoetryInstalled } from '../../src';

test('isPoetryInstalled', async () => {
  const res = await isPoetryInstalled();
  // version depends on test matrix
  /* eslint-disable no-console */
  console.log(`Jest test: poetry version is ${res.version}`);
  expect(res.version).not.toBeNull();
});
