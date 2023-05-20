import { OpenAIAzureProvider } from '../provider/open-ai.provider';
import { FileUtil } from '../util/file.util';
import * as path from 'path';
import { Content } from '../interface/content.interface';
import { LoggerUtil } from '../util/logger.util';
import { MemoryUtil } from '../util/memory.util';
import { StorageUtil } from '../util/storage.util';
import { ActionType } from '../enum/action-type.enum';
import { Action, ActionResponse } from '../interface/gpt.interface';
import { Actionable } from '../interface/actionable.interface';
import { ActionUtil } from '../util/action.util';

/**
 * A base class for AGI (Artificial General Intelligence).
 */
export class MainAGI<T extends ActionType> {
  protected mainPrompt: string;
  protected nextPrompt: string;
  protected dirname: string;
  protected taskDir: string;
  protected ltmPath: string;
  protected logPath: string;
  protected consolidationId: string;
  protected actionUtil: Actionable<T>;
  protected fileUtil: FileUtil;
  protected loggerUtil: LoggerUtil;

  /**
   * Creates a new MainAGI object.
   *
   * @param openAIProvider - The OpenAIAzureProvider to use for the AGI.
   * @param maxRetryCount - Retry count for calling the GPT-4 API in case of rate limit or timeout
   * @param maxRetryInterval - Retry interval for calling the GPT-4 API in case of rate limit or timeout in milliseconds
   */
  constructor(
    protected openAIProvider: OpenAIAzureProvider,
    protected maxRetryCount: number,
    protected maxRetryInterval: number
  ) {
    this.fileUtil = new FileUtil();
    this.loggerUtil = {} as LoggerUtil;
    this.actionUtil = {} as Actionable<T>;
    this.mainPrompt = '';
    this.nextPrompt = '';
    this.ltmPath = '';
    this.consolidationId = '';
    this.taskDir = '';
    this.logPath = '';
    this.dirname = '';
  }

  /**
   * Initializes the AGI.
   */
  protected initialize(dirname: string, consolidationId: string) {
    this.consolidationId = consolidationId;
    this.dirname = dirname;

    this.ltmPath = path.join(
      this.dirname,
      '..',
      '..',
      'output',
      'memory',
      this.consolidationId + '.json'
    );

    this.logPath = path.join(
      this.dirname,
      '..',
      '..',
      'output',
      'log',
      this.consolidationId + '.log'
    );

    this.taskDir = path.join(
      this.dirname,
      '..',
      '..',
      'task',
      this.consolidationId
    );

    this.loggerUtil = new LoggerUtil(this.consolidationId, this.logPath);
  }

  public isOneMinuteExceeded(previousDate: Date, currentDate: Date): boolean {
    const timeDifference = currentDate.getTime() - previousDate.getTime();
    const oneMinuteInMillis = 60 * 1000; // One minute in milliseconds

    return timeDifference > oneMinuteInMillis;
  }

  /**
   * Starts an AGI (Artificial General Intelligence) action by initializing necessary components,
   * clearing previous folders, and generating prompts for user input based on previous responses.
   * @param content Object containing information about the current action to be performed.
   * @returns A promise that resolves when the action is completed.
   */
  public start = async (content: Content): Promise<any> => {
    this.initialize(this.dirname, this.consolidationId);

    await this.clearFolders(this.loggerUtil);

    await this.fileUtil.createFolder(this.taskDir);

    let startDate = new Date();

    this.loggerUtil.log('Action started at ' + startDate.toISOString());

    this.openAIProvider.initialize(this.loggerUtil);

    const TPM = 60000;

    const memoryUtil = new MemoryUtil(this.fileUtil, this.ltmPath);
    await memoryUtil.resetLTM();

    const storageUtil = new StorageUtil();

    let mainPrompt = this.mainPrompt
      .replace('{{ENVIRONMENT}}', content.environment)
      .replace('{{NAME}}', content.name)
      .replace('{{INPUT}}', content.input);

    let subPrompt = this.nextPrompt
      .replace('{{ENVIRONMENT}}', content.environment)
      .replace('{{NAME}}', content.name)
      .replace('{{INPUT}}', content.input);

    let max_tokens = this.openAIProvider.getMaxTokens(mainPrompt);

    mainPrompt = mainPrompt.replace('{{MAX_TOKEN}}', max_tokens.toString());

    this.loggerUtil.log('Initialized AGI.');

    let res = await this.openAIProvider.generateCompletion(
      mainPrompt,
      max_tokens
    );
    let parsed = await this.processGpt4ApiResponse(
      res as string,
      this.loggerUtil,
      0
    );

    this.loggerUtil.log('Initial response is captured. Processing..');

    await memoryUtil.writeLTM(parsed);

    this.loggerUtil.log('Initial response is written to LTM.');

    let estimation = 0;

    if (parsed.neededStepCount) {
      const action = {
        type: ActionType.REQUEST_USER_INPUT,
        input: {
          request:
            'I will need ' +
            parsed.neededStepCount.toString() +
            ' step to complete the task. To confirm type (y), otherwise I will stop.',
        },
      } as Action<T>;

      const actionUtilLegacy = new ActionUtil(
        this.loggerUtil,
        this.taskDir,
        this.ltmPath
      );

      const actRes = await actionUtilLegacy.takeAction(action);
      estimation = parsed.neededStepCount;
      if (actRes !== 'y') {
        return;
      }
    } else {
      this.loggerUtil.log('Estimation is not provided by AGI.');
    }

    const steps: string[] = parsed.steps;

    subPrompt = subPrompt
      .replace('{{ALL_STEPS}}', JSON.stringify(steps))
      .replace('{{MAX_ATTEMPT}}', estimation.toString());

    let attemptCount = 1;

    let iteration = 0;

    let currentToken = 0;

    while (!parsed.completed && content.maxAttempt >= attemptCount) {
      const stepName = 'Step ' + attemptCount.toString() + ': ' + parsed.step;

      this.loggerUtil.log(stepName);

      storageUtil.addStep(parsed.step);

      let actionResponses: ActionResponse<T>[] = [];

      if (
        parsed.actions &&
        Array.isArray(parsed.actions) &&
        parsed.actions.length > 0
      ) {
        for (const a of parsed.actions) {
          const actionResponse = { action: a } as ActionResponse<T>;
          this.loggerUtil.log('Taking action: ', a);
          actionResponse.response = await this.actionUtil.takeAction(a);
          this.loggerUtil.log('Action response: ', actionResponse.response);
          actionResponses.push(actionResponse);
        }
      }

      const lastSteps = storageUtil.getLastSteps();

      let nextPrompt = subPrompt
        .replace('{{ACTION_RESPONSES}}', JSON.stringify(actionResponses))
        .replace('{{LAST_STEPS}}', JSON.stringify(lastSteps));

      max_tokens = this.openAIProvider.getMaxTokens(nextPrompt);

      nextPrompt = nextPrompt.replace('{{MAX_TOKEN}}', max_tokens.toString());

      if (attemptCount === estimation + 10 * iteration) {
        iteration++;
        const action = {
          type: ActionType.REQUEST_USER_INPUT,
          input: {
            request:
              'I still have steps to complete the task. If you want me to continue with 10 more steps please confirm type (y), otherwise I will stop.',
          },
        } as Action<T>;

        const actRes = await this.actionUtil.takeAction(action);
        if (actRes !== 'y') {
          return false;
        }
      }

      // Rate Limit Fix
      const now = new Date();

      if (this.isOneMinuteExceeded(startDate, now)) {
        currentToken = 0;
      } else if (TPM <= currentToken) {
        const delayInterval = now.getTime() - startDate.getTime();
        const delaySeconds = delayInterval / 1000;

        this.loggerUtil.log(
          `Waiting ${delaySeconds} seconds to avoid exceeding the rate limit.`
        );
        await this.delay(delayInterval);
        startDate = new Date();
      }

      try {
        res = await this.openAIProvider.generateCompletion(
          nextPrompt,
          max_tokens
        );

        currentToken += this.openAIProvider.countTokens(nextPrompt);

        this.loggerUtil.log('Response is captured. Processing..');

        parsed = await this.processGpt4ApiResponse(
          res as string,
          this.loggerUtil,
          0
        );
      } catch (e) {
        this.loggerUtil.error('Error while generating completion: ', e);
      }

      await memoryUtil.writeLTM(parsed);

      this.loggerUtil.log('Response is written to LTM.');

      attemptCount++;
    }

    if (content.maxAttempt <= attemptCount) {
      this.loggerUtil.log('Reached out to maximum attempt.');
    }

    this.loggerUtil.log('Action ended at ' + new Date().toISOString());
  };

  /**
   * Clears task, LTM, and log folders using the fileUtil object.
   * Logs any errors using the provided loggerUtil object.
   * @param loggerUtil - The loggerUtil object to use for logging errors.
   */
  private clearFolders = async (loggerUtil: LoggerUtil) => {
    const ltmDirName = path.dirname(this.ltmPath);
    const logDirName = path.dirname(this.logPath);

    try {
      await this.fileUtil.clearFolder(this.taskDir);
    } catch (e) {
      loggerUtil.error('Error while clearing folders: ', e);
    }

    try {
      await this.fileUtil.clearFolder(ltmDirName);
    } catch (e) {
      loggerUtil.error('Error while clearing folders: ', e);
    }

    try {
      await this.fileUtil.clearFolder(logDirName);
    } catch (e) {
      loggerUtil.error('Error while clearing folders: ', e);
    }
  };

  /**
   * Processes the response from OpenAI's GPT-4 API.
   * @param response The response string from the GPT-4 API.
   * @param loggerUtil The logger utility to log messages.
   * @param retrial The number of times the method has been retried due to an invalid JSON response.
   * @returns The parsed JSON response from the GPT-4 API, or null if the response is invalid.
   */
  protected processGpt4ApiResponse = async (
    response: string,
    loggerUtil: LoggerUtil,
    retrial: number
  ): Promise<any> => {
    let responseObject;

    response = response.replace(/```json/g, '').replace(/```/g, '');

    try {
      // Attempt to parse the response as a JSON object
      responseObject = JSON.parse(response.trim());
    } catch (error) {
      // If the response is not a valid JSON string, print an error message
      const fixJson =
        'Fix this json and provide only fixed json object in the response: ' +
        response;
      loggerUtil.error('Received an invalid JSON response:', response);

      const max_tokens = this.openAIProvider.getMaxTokens(fixJson);
      const res = await this.openAIProvider.generateCompletion(
        fixJson,
        max_tokens
      );

      if (retrial < this.maxRetryCount) {
        retrial++;
        await new Promise((resolve) =>
          setTimeout(resolve, this.maxRetryInterval)
        );
        return await this.processGpt4ApiResponse(
          res as string,
          loggerUtil,
          retrial
        );
      }
    }

    if (!responseObject) {
      loggerUtil.error('Received an empty response object.');
      return;
    }

    // Now you can use 'responseObject' as a JSON object
    // You can add your logic here to handle the responseObject

    loggerUtil.log('Parsed JSON response:', responseObject);

    responseObject.completed = responseObject.completed
      ? responseObject.completed
      : false;

    // Example: If the responseObject has a 'completed' property and its value is true
    if (responseObject.completed) {
      loggerUtil.log('The project is completed.');
    } else {
      loggerUtil.log('The project is not completed yet.');
    }

    return responseObject;
  };

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
