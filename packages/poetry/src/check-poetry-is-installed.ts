import * as debugLib from 'debug';

import { execute, ExecuteResponse } from '@snyk/child-process';

const debug = debugLib('snyk-fix:poetry');

export function extractPoetryVersion(stdout: string): string | null {
  /* stdout example:
   * Poetry version 1.1.4
   */
  let version: string | null = null;
  const re = new RegExp(/^Poetry\sversion\s([0-9.]+)/, 'g');
  const match = re.exec(stdout);
  if (match) {
    version = match[1];
  }
  return version;
}

export async function isPoetryInstalled(): Promise<{
  version: string | null;
}> {
  let res: ExecuteResponse;
  try {
    res = await execute('poetry', ['--version'], {});
  } catch (e) {
    debug('Execute failed with', e);
    res = e;
  }
  if (res.exitCode !== 0) {
    throw res.error;
  }

  return { version: extractPoetryVersion(res.stdout) };
}
