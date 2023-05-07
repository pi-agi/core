/**
 * A utility class for storing and retrieving last steps.
 */
export class StorageUtil {
  /**
   * Constructs a new StorageUtil object with an optional array of last steps.
   *
   * @param lastSteps - (Optional) An array of last steps.
   */
  constructor(private lastSteps: string[] = []) {}

  /**
   * Adds a new step to the array of last steps.
   *
   * @param step - The step to be added to the array.
   */
  addStep = (step: string) => {
    this.lastSteps.push(step);
  };

  /**
   * Gets the array of last steps.
   *
   * @returns The array of last steps.
   */
  getLastSteps = () => {
    return this.lastSteps;
  };
}
