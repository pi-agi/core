/**
 * An enum representing the different types of actions that can be performed in an AGI.
 */
export enum ActionType {
  /**
   * Action to read from a long-term memory (LTM).
   */
  READ_LTM = 'readltm',

  /**
   * Action to write to a file.
   */
  WRITE_FILE = 'writefile',

  /**
   * Action to read from a file.
   */
  READ_FILE = 'readfile',

  /**
   * Action to request user input.
   */
  REQUEST_USER_INPUT = 'userinput',

  /**
   * Action to execute a command.
   */
  EXECUTE_COMMAND = 'excmd',
}
