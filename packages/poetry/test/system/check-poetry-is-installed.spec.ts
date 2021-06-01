import { isPoetryInstalled } from '../../src';

test('isPoetryInstalled', async () => {
  const res = await isPoetryInstalled();
  // version depends on test matrix
  expect(res.version).not.toBeNull();
});
