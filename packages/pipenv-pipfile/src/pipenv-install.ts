import * as debugLib from 'debug';
import Bottleneck from 'bottleneck';

import { execute, ExecuteResponse } from '@snyk/child-process';

const debug = debugLib('snyk-fix:python:Pipfile');

interface PipEnvConfig {
  python?: string; // use the provided Python interpreter
}

const limiter = new Bottleneck({
  maxConcurrent: 4,
});

// https://pipenv.pypa.io/en/latest/advanced/#changing-default-python-versions
function getPythonArgs(config: PipEnvConfig): string[] | void {
  const args = [];
  if (config.python) {
    args.push('--python', config.python); // Performs the installation in a virtualenv using the provided Python interpreter.
  }
  if (process.env.PIPENV_SKIP_LOCK) {
    args.push('--skip-lock');
  }
  return args;
}
async function runPipenvInstall(
  projectPath: string,
  requirements: string[],
  config: PipEnvConfig,
): Promise<ExecuteResponse> {
  const args = ['install', ...requirements];

  const pythonArg = getPythonArgs(config);
  if (pythonArg) {
    args.push(...pythonArg);
  }

  let res: ExecuteResponse;

  try {
    res = await execute('pipenv', args, {
      cwd: projectPath,
    });
  } catch (e) {
    debug('Execute failed with', e);
    res = e;
  }

  return res;
}
export const pipenvInstall = limiter.wrap(runPipenvInstall);
