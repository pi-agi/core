/**
 * An interface representing the content of an AGI input.
 */
 export interface Content {
  /**
   * The environment in which the AGI will be executed.
   */
  environment: string;

  /**
   * The default maximum number of attempts to execute the AGI.
   */
  maxAttempt: number;

  /**
   * The input data to be used by the AGI. For example Project Documentation for Software Engineer AGIs.
   */
  input: string;

  /**
   * The name of the project or task.
   */
  name: string;
}
