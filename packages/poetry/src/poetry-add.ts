import * as debugLib from 'debug';
import Bottleneck from 'bottleneck';

import { execute, ExecuteResponse } from '@snyk/child-process';

const debug = debugLib('snyk-fix:poetry');

interface PoetryConfig {
  dev?: boolean;
  python?: string; // python interpreter to use, cli used --command argument for this
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

  if (config.python) {
    try {
      // tell poetry to use the given interpreter
      // https://python-poetry.org/docs/managing-environments/
      await execute('poetry', ['env', 'use', config.python], {
        cwd: projectPath,
      });
    } catch (e) {
      debug(`'poetry use env ${config.python}' failed with`, e);
    }
  }

  try {
    res = await execute('poetry', args, {
      cwd: projectPath,
    });
  } catch (e) {
    debug('Execute failed with', e);
    res = e;
  }

  if (config.python) {
    try {
      // set it back to system python
      await execute('poetry', ['env', 'use', 'system'], {
        cwd: projectPath,
      });
    } catch (e) {
      debug(`'poetry use env system' failed with`, e);
    }
  }

  return res;
}
export const poetryAdd = limiter.wrap(runPoetryAdd);
