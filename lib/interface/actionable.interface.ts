import { ActionType } from '../enum/action-type.enum';
import { Action } from './gpt.interface';

/**
 * The Actionable interface provides a blueprint for classes that need to
 * process and execute various actions based on the given input.
 *
 * Classes implementing the Actionable interface must have a takeAction method
 * that receives an Action object and returns a Promise, handling the action
 * as needed. This interface is specifically designed for handling different
 * types of actions in the context of a music composition application.
 */
export interface Actionable<T extends ActionType> {
  /**
   * The takeAction method processes and executes the given action.
   *
   * @param action - An object representing the action to be executed.
   * @returns A Promise that resolves when the action is complete. The resolved
   *          value can be any type, depending on the action taken.
   */
  takeAction(action: Action<T>): Promise<any>;
}
