import * as debugLib from 'debug';
import { execute, ExecuteResponse } from '@snyk/child-process';

const debug = debugLib('snyk-fix:python:Pipfile');

export function extractPipenvVersion(stdout: string): string | null {
  /* stdout example:
   * pipenv, version 2018.11.26\n
   */
  let version: string | null = null;
  const re = new RegExp(/^pipenv,\sversion\s([0-9.]+)/, 'g');
  const match = re.exec(stdout);
  if (match) {
    version = match[1];
  }
  return version;
}

export async function isPipenvInstalled(): Promise<{
  version: string | null;
}> {
  let res: ExecuteResponse;
  try {
    res = await execute('pipenv', ['--version'], {});
  } catch (e) {
    debug('Execute failed with', e);
    res = e;
  }
  if (res.exitCode !== 0) {
    throw res.error;
  }

  return { version: extractPipenvVersion(res.stdout) };
}
