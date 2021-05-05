import * as debugLib from 'debug';
import Bottleneck from 'bottleneck';

import { execute, ExecuteResponse } from './sub-process';

const debug = debugLib('snyk-fix:python:Pipfile');

interface PipEnvConfig {
  pythonVersion?: '2' | '3';
  command?: string; // use the provided Python interpreter
}

const limiter = new Bottleneck({
  maxConcurrent: 4,
});

// https://pipenv.pypa.io/en/latest/advanced/#changing-default-python-versions
function getPythonversionArgs(config: PipEnvConfig): string | void {
  if (config.command) {
    return '--python'; // Performs the installation in a virtualenv using the provided Python interpreter.
  }
  if (config.pythonVersion === '2') {
    return '--two'; // Performs the installation in a virtualenv using the system python3 link.
  }
  if (config.pythonVersion === '3') {
    return '--three'; // Performs the installation in a virtualenv using the system python2 link.
  }
}
async function runPipenvInstall(
  projectPath: string,
  requirements: string[],
  config: PipEnvConfig,
): Promise<ExecuteResponse> {
  const args = ['install', ...requirements];

  const pythonVersionArg = getPythonversionArgs(config);
  if (pythonVersionArg) {
    args.push(pythonVersionArg);
  }

  let res: ExecuteResponse;

  try {
    res = await execute('pipenv', args, { cwd: projectPath });
  } catch (e) {
    debug('Execute failed with', e);
    res = e;
  }

  return res;
}
export const pipEnvInstall = limiter.wrap(runPipenvInstall);
