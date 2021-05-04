import { pipenvPipfileFix } from "../src";

test('Is everything ready for the development?', async () => {
  expect(pipenvPipfileFix()).toBeTruthy();
});
