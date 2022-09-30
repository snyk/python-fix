import { spawn, SpawnOptions } from 'child_process';

export interface ExecuteResponse {
  exitCode: number | null;
  stderr: string;
  stdout: string;
  error?: unknown;
  command: string;
  duration: number;
}

// Executes a subprocess.
// Resolves successfully on exit code 0 with all the info
// available
export async function execute(
  command: string,
  args: string[],
  options: { cwd?: string },
): Promise<ExecuteResponse> {
  const spawnOptions: SpawnOptions = {
    shell: false,
    detached: true, // do not send signals to child processes
  };
  if (options && options.cwd) {
    spawnOptions.cwd = options.cwd;
  }
  const fullCommand = `${command} ${args.join(' ')}`;
  const startTime = Date.now();
  let processId;
  try {
    const worker = spawn(command, args, options);
    processId = worker.pid;
    return await new Promise((resolve, reject) => {
      let stderr = '';
      let stdout = '';

      worker.stdout.on('data', (data) => {
        stdout += data;
      });
      worker.stderr.on('data', (data) => {
        stderr += data;
      });
      worker.on('error', (e) => {
        reject({
          stderr,
          stdout,
          error: e,
          duration: Date.now() - startTime,
          command: fullCommand,
        });
      });
      worker.on('exit', (code) => {
        if (code && code > 0) {
          resolve({
            stderr,
            stdout,
            duration: Date.now() - startTime,
            command: fullCommand,
            exitCode: code,
          });
        } else {
          resolve({
            stderr,
            stdout,
            duration: Date.now() - startTime,
            command: fullCommand,
            exitCode: code,
          });
        }
      });
    });
  } finally {
    if (processId) {
      // Additional anti-zombie protection.
      // Process here should be already stopped.
      try {
        process.kill(processId, 'SIGKILL');
      } catch (e) {
        // Process already stopped.
      }
    }
  }
}
