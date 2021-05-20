import { pipRequirementsFix } from "../src";

describe('Is everything ready for the development?', async () => {
  expect(pipRequirementsFix()).toBeTruthy();
});
