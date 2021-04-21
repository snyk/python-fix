import { pipRequirementsFix } from "../src";

test('Is everything ready for the development?', async () => {
  expect(pipRequirementsFix()).toBeTruthy();
});
