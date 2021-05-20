import { pipRequirementsFix } from '../src';

describe('pipRequirementsFix', () => {
  it('Is everything ready for the development?', () => {
    expect(pipRequirementsFix()).toBeTruthy();
  });
});
