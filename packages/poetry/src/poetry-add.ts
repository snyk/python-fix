import * as debugLib from 'debug';
import Bottleneck from 'bottleneck';

import { execute, ExecuteResponse } from '@snyk/child-process';

const debug = debugLib('snyk-fix:poetry');

interface PoetryConfig {
  dev?: boolean;
}

const limiter = new Bottleneck({
  maxConcurrent: 4,
});

async function runPoetryAdd(
  projectPath: string,
  dependencyUpdates: string[],
  config: PoetryConfig,
): Promise<ExecuteResponse> {
  const args = ['add', ...dependencyUpdates];

  let res: ExecuteResponse;

  if (config.dev) {
    args.push('--dev');
  }

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
