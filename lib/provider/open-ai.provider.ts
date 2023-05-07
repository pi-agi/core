import axios from 'axios';
import { Completion } from '../interface/gpt.interface';
import { LoggerUtil } from '../util/logger.util';

/**
 * A utility class for interacting with the OpenAI API on Azure.
 */
export class OpenAIAzureProvider {
  private loggerUtil: LoggerUtil | undefined;

  /**
   * Constructs a new OpenAIAzureProvider object with the given parameters.
   *
   * @param apiKey - The API key to use for authentication.
   * @param apiUrl - The URL of the API endpoint.
   * @param apiVersion - The version of the API to use.
   * @param MAX_TOKEN_COUNT - The maximum number of tokens allowed in a request.
   * @param MAX_RETRY_COUNT - The maximum number of times to retry a request.
   * @param RETRY_INTERVAL - The interval in milliseconds between retry attempts.
   */
  constructor(
    private apiKey: string,
    private apiUrl: string,
    private apiVersion: string,
    private MAX_TOKEN_COUNT: number,
    private MAX_RETRY_COUNT: number,
    private RETRY_INTERVAL: number
  ) {}

  /**
   * Initializes the OpenAIAzureProvider object with a given LoggerUtil.
   *
   * @param loggerUtil - The LoggerUtil object to use for logging.
   */
  initialize = (loggerUtil: LoggerUtil) => {
    this.loggerUtil = loggerUtil;
  };

  /**
   * Generates a completion for a given prompt with a given number of maximum tokens.
   *
   * @param prompt - The prompt to generate a completion for.
   * @param max_tokens - The maximum number of tokens to use in the completion.
   * @returns A Promise that resolves with the generated code if it succeeds, or null if it fails.
   * @throws A TypeError if the logger is not assigned.
   */
  generateCompletion = async (
    prompt: string,
    max_tokens: number
  ): Promise<string | null> => {
    if (!this.loggerUtil) {
      throw new TypeError('Logger not assigned');
    }

    const openaiResponse = await this.createCompletion({
      messages: [{ role: 'system', content: prompt }],
      max_tokens,
      n: 1,
      temperature: 0,
    } as Completion);

    const code = openaiResponse.data.choices[0].message.content;

    this.loggerUtil.log('AGI Response: ', code);

    return code as string;
  };

  /**
   * Gets the maximum number of tokens allowed for a given prompt.
   *
   * @param prompt - The prompt to get the maximum number of tokens for.
   * @returns The maximum number of tokens allowed.
   */
  getMaxTokens = (prompt: string) => {
    return this.MAX_TOKEN_COUNT - this.countTokens(prompt) - 10;
  };

  /**
   * Sends a completion request to OpenAI API.
   *
   * @param completion - The completion request object.
   * @param retryCount - The current retry count.
   * @returns The response from the OpenAI API.
   * @throws Throws an error if the API request fails after MAX_RETRY_COUNT attempts.
   */
  createCompletion = async (
    completion: Completion,
    retryCount: number = 0
  ): Promise<any> => {
    try {
      const endpoint = '/chat/completions';
      const version = 'api-version=' + this.apiVersion;

      const response = await axios.post(
        `${this.apiUrl}${endpoint}?${version}`,
        completion,
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error(`Error in createCompletion: ${error}`);
      if (
        error.response &&
        (error.response.status === 429 || error.response.status === 408) &&
        retryCount < this.MAX_RETRY_COUNT
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.RETRY_INTERVAL)
        );
        return this.createCompletion(completion, retryCount + 1);
      }
      throw error;
    }
  };

  /**
   * Counts the number of tokens in a given text string.
   *
   * @param text - The text to count tokens for.
   * @returns The number of tokens in the text.
   */
  countTokens(text: string): number {
    const wordRegex = /[\w']+/g;
    const punctRegex =
      /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@\[\]^_`{|}~]/g;

    const wordTokens = text.match(wordRegex) || [];
    const punctTokens = text.match(punctRegex) || [];
    const spaceTokens = text.split(' ').length - 1;

    const tokenCount = wordTokens.length + punctTokens.length + spaceTokens;
    return tokenCount;
  }
}
