import { checkPipenvInstalled } from '../../src';

test('checkPipenvInstalled', async () => {
  const res = await checkPipenvInstalled();
  // version depends on test matrix
  expect(res.version).not.toBeNull();
});
