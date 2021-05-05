import { isPipenvInstalled } from '../../src';

test('isPipenvInstalled', async () => {
  const res = await isPipenvInstalled();
  // version depends on test matrix
  expect(res.version).not.toBeNull();
});
