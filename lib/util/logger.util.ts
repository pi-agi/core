import { FileUtil } from './file.util';

/**
 * A utility class for logging messages to the console and a log file.
 */
export class LoggerUtil {
  private fileUtil: FileUtil;

  /**
   * Constructs a new LoggerUtil object with a given consolidation ID and log file path.
   *
   * @param consolidationId - The consolidation ID to be included in the log messages.
   * @param logPath - The path to the log file.
   */
  constructor(private consolidationId: string, private logPath: string) {
    this.fileUtil = new FileUtil();
  }

  /**
   * Logs a message to the console and the log file.
   *
   * @param message - The message to be logged.
   * @param data - (Optional) The data to be included in the log message.
   */
  log = (message: string, data: any = null) => {
    const logMessage = this.createMessage(message, data);
    console.log(logMessage);

    try {
      this.writeToLogFile(logMessage);
    } catch (e) {
      const warnMessage = this.createMessage(
        'Error while writing log to file',
        e
      );
      console.warn(warnMessage);
    }
  };

  /**
   * Logs an error message to the console and the log file.
   *
   * @param message - The error message to be logged.
   * @param data - (Optional) The data to be included in the log message.
   */
  error = (message: string, data: any = null) => {
    const logMessage = this.createMessage(message, data);
    console.error(logMessage);

    try {
      this.writeToLogFile(logMessage);
    } catch (e) {
      const warnMessage = this.createMessage(
        'Error while writing log to file',
        e
      );
      console.warn(warnMessage);
    }
  };

  /**
   * Creates a log message with the consolidation ID, message and data (if any).
   *
   * @param message - The message to be included in the log message.
   * @param data - (Optional) The data to be included in the log message.
   * @returns A log message string.
   */
  private createMessage = (message: string, data: any) => {
    return (
      this.consolidationId +
      ': ' +
      message +
      ' ' +
      (data ? JSON.stringify(data) : '')
    );
  };

  /**
   * Writes a log message to the log file with a timestamp.
   *
   * @param message - The message to be written to the log file.
   */
  private writeToLogFile = (message: string) => {
    const logDate = new Date().toISOString();
    const logMessage = `[${logDate}] - ${message}\n`;

    this.fileUtil.appendFile(this.logPath, logMessage);
  };
}
