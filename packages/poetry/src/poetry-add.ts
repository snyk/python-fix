import * as debugLib from 'debug';
import Bottleneck from 'bottleneck';

import { execute, ExecuteResponse } from '@snyk/child-process';

const debug = debugLib('snyk-fix:poetry');

const limiter = new Bottleneck({
  maxConcurrent: 4,
});

async function runPoetryAdd(
  projectPath: string,
  dependencyUpdates: string[],
): Promise<ExecuteResponse> {
  const args = ['add', ...dependencyUpdates];

  let res: ExecuteResponse;

  try {
    res = await execute('poetry', args, {
      cwd: projectPath,
    });
  } catch (e) {
    debug('Execute failed with', e);
    res = e;
  }

  return res;
}
export const poetryAdd = limiter.wrap(runPoetryAdd);
