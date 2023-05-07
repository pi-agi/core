import { spawn } from 'child_process';
import { LoggerUtil } from './logger.util';

/**
 * A utility class for executing shell commands.
 */
export class ShellUtil {
  /**
   * Constructs a new ShellUtil object with a given LoggerUtil.
   *
   * @param loggerUtil - The LoggerUtil object used to log the output and errors of the executed commands.
   */
  constructor(private loggerUtil: LoggerUtil) {}

  /**
   * Executes a shell command with the given working directory.
   *
   * @param command - The command to be executed.
   * @param cwd - The working directory where the command should be executed.
   * @returns A Promise that resolves with the output of the command if it succeeds, or rejects with the error message if it fails.
   */
  executeCommand = (command: string, cwd: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const childProcess = spawn(cmd, args, { cwd });

      let stdoutData = '';
      let stderrData = '';

      childProcess.stdout.on('data', (data) => {
        stdoutData += data;
        this.loggerUtil.log(`stdout: ${data}`);
      });

      childProcess.stderr.on('data', (data) => {
        stderrData += data;
        this.loggerUtil.error(`stderr: ${data}`);
      });

      childProcess.on('close', (code) => {
        if (code !== 0) {
          this.loggerUtil.error(
            `Error while executing command '${command}':`,
            stderrData
          );
          if (stderrData.includes('Read-only file system')) {
            reject(
              new Error(
                `Failed to execute command '${command}': Read-only file system`
              )
            );
          } else {
            reject(stderrData);
          }
        } else {
          resolve(stdoutData);
        }
      });

      childProcess.on('error', (error) => {
        this.loggerUtil.error(`Error: ${error.message}`);
        reject(error);
      });
    });
  };
}
