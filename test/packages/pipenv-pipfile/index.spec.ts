import { pipenvPipfileFix } from '../../../src/packages/pipenv-pipfile';
test('Is everything ready for the development?', async () => {
  expect(pipenvPipfileFix()).toBeTruthy();
});
