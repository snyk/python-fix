import { pipRequirementsFix } from '../../../src/packages/pip-requirements';
test('Is everything ready for the development?', async () => {
  expect(pipRequirementsFix()).toBeTruthy();
});
