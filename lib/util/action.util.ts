import { ActionType } from '../enum/action-type.enum';
import { Action } from '../interface/gpt.interface';
import { LoggerUtil } from './logger.util';
import { ShellUtil } from './shell.util';
import * as path from 'path';
import { UserInteractionUtil } from './user-interaction.util';
import { MemoryUtil } from './memory.util';
import { FileUtil } from './file.util';
import { Actionable } from '../interface/actionable.interface';

/**
 * ActionUtil is a class responsible for handling different actions
 * based on the given action type. It provides methods to perform
 * various operations such as executing commands, requesting user input,
 * reading and writing files, and interacting with long-term memory.
 */
export class ActionUtil<T extends ActionType> implements Actionable<T> {
  private shellUtil: ShellUtil;
  private userInteractionUtil: UserInteractionUtil;
  private memoryUtil: MemoryUtil;
  private fileUtil: FileUtil;

  /**
   * Constructs an instance of ActionUtil with the required dependencies.
   *
   * @param loggerUtil - An instance of LoggerUtil for logging purposes.
   * @param taskDir - The directory path where the task is located.
   * @param ltmPath - The path to the long-term memory file.
   */
  constructor(
    private loggerUtil: LoggerUtil,
    private taskDir: string,
    private ltmPath: string
  ) {
    this.shellUtil = new ShellUtil(this.loggerUtil);
    this.userInteractionUtil = new UserInteractionUtil();
    this.fileUtil = new FileUtil();
    this.memoryUtil = new MemoryUtil(this.fileUtil, this.ltmPath);
  }

  /**
   * Processes the given action based on its type.
   *
   * @param action - The action to be processed.
   * @returns The result of the action, or an error if one occurs.
   */
  takeAction = async (action: Action<T>): Promise<any> => {
    try {
      switch (action.type) {
        case ActionType.EXECUTE_COMMAND:
          return await this.executeCommandAction(action.input);
        case ActionType.REQUEST_USER_INPUT:
          return await this.requestUserInputAction(action.input);
        case ActionType.READ_LTM:
          return await this.readLTMAction(action.input);
        case ActionType.WRITE_FILE:
          return await this.writeFileAction(action.input);
        case ActionType.READ_FILE:
          return await this.readFileAction(action.input);
      }
    } catch (e) {
      return e;
    }
  };

  /**
   * Reads the content of a file.
   *
   * @param input - The input object containing the path to the file.
   * @returns The file content as a string.
   */
  readFileAction = async (input: any) => {
    this.loggerUtil.log('readFileAction: ', input);
    return await this.fileUtil.readFileContent(
      path.join(this.taskDir, input.cwd)
    );
  };

  /**
   * Writes content to a file.
   *
   * @param input - The input object containing the path to the file and the content to be written.
   * @returns A boolean indicating whether the file was written successfully.
   */
  writeFileAction = async (input: any) => {
    this.loggerUtil.log('writeFileAction: ', input);
    return await this.fileUtil.writeFile(
      path.join(this.taskDir, input.cwd),
      input.content
    );
  };

  /**
   * Reads data from the long-term memory.
   *
   * @param input - The input object containing the context for querying the long-term memory.
   * @returns The data read from the long-term memory.
   */
  readLTMAction = async (input: any) => {
    this.loggerUtil.log('readLTMAction: ', input);
    return await this.memoryUtil.readLTMByContext(input);
  };

  /**
   * Executes a command.
   *
   * @param input - The input object containing the command to be executed and the current working directory.
   * @returns The result of the command execution.
   */
  executeCommandAction = async (input: any) => {
    this.loggerUtil.log('executeCommandAction: ', input);
    return await this.shellUtil.executeCommand(
      input.execute,
      path.join(this.taskDir, input.cwd)
    );
  };

  /**
   * Requests user input.
   *
   * @param input - The input object containing the request message.
   * @returns The user input as a string.
   */
  requestUserInputAction = async (input: any) => {
    this.loggerUtil.log('requestUserInputAction: ', input);
    return await this.userInteractionUtil.getUserInput(input.request);
  };
}
