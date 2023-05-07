import * as readline from 'readline';

/**
 * A utility class for interacting with the user through the command line.
 */
export class UserInteractionUtil {
  /**
   * Prompts the user for input with a given request.
   *
   * @param request - The request to be displayed to the user.
   * @returns A Promise that resolves with the user's input.
   */
  getUserInput = async (request: string): Promise<string> => {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(request + '\n', (answer) => {
        resolve(answer);
        rl.close();
      });
    });
  };
}
