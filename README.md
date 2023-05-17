# @pi-agi/core Library

The very first AGI library has core functionalities to help you to generate your Personalized Artificial General Intelligence.

## PI AGI: Personalized Artificial General Intelligence

[![Donate](https://img.shields.io/badge/Donate-Buy%20Me%20a%20Coffee-yellow.svg)](https://www.buymeacoffee.com/RwIpTEd)
[![Stars](https://img.shields.io/github/stars/pi-agi/core.svg?style=flat-square)](https://github.com/pi-agi/core/stargazers)

Welcome to PI AGI, a groundbreaking project that aims to revolutionize the world of Artificial Intelligence. By developing a base for role-based AGIs (Artificial General Intelligences) that are personalized and optimized for specific tasks, we can unlock the true power and meaning of AGI. As we usher in a new era of AI-driven advancements, it's time for everyone to get ready and embrace the potential of personalized AGIs, which will play a transformative role in shaping our world and driving innovation across various domains.

This library provides core functionalities for PI AGI applications. Users can simply implement AGI, set main and next prompts, and define actions that implement the `Actionable` interface.

## Table of Contents

- [The Ultimate Vision](#sparkles-the-ultimate-vision)
- [Getting Started](#rocket-getting-started)
- [Repository Overview](#wrench-repository-overview)
  - [Environment Parameters](#environment-parameters)
  - [Working Styles](#working-styles)
  - [Project Goal](#project-goal)
- [Get Involved](#star-get-involved)
  - [Donations](#donations)
  - [Contributors](#contributors)
- [Join the Community](#handshake-join-the-community)

## :sparkles: The Ultimate Vision

Envision a future where personalized AGIs effortlessly blend into our everyday lives, significantly boosting productivity and stimulating creativity in diverse fields like software development, medicine, finance, and beyond. At PI AGI, we aim to actualize this aspiration by laying the groundwork for AGIs specifically designed and optimized for distinct roles and tasks. 

By harnessing the power of AGI, we can accelerate innovation, tackle complex challenges, and revolutionize the way we work and live. By developing an ecosystem of interconnected, intelligent agents, we can break down barriers between disciplines and enable unprecedented collaboration, ultimately pushing the boundaries of what is possible. PI AGI will be a critical stepping stone towards achieving a more intelligent, efficient, and creative future for all.

## :rocket: Getting Started

Follow these steps to start exploring the world of PI AGI:

1. Define the `main` and `next` prompts in your repository.
2. Implement the AGI and set the paths for main and next prompts.
```javascript
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ActionType, MainAGI, OpenAIAzureProvider, ActionUtil } from '@pi-agi/core';

/**
 * A class representing a Senior Backend Software Engineer AGI.
 */
export class SeniorBackendSoftwareEngineerAGI extends MainAGI<ActionType> {
  constructor(
    openAIProvider: OpenAIAzureProvider,
    maxRetryCount: number,
    maxRetryInterval: number
  ) {
    super(openAIProvider, maxRetryCount, maxRetryInterval);
  }

  /**
   * Initializes the AGI.
   */
  async init() {
    this.consolidationId = uuidv4();
    super.consolidationId = this.consolidationId;

    super.initialize(__dirname, this.consolidationId);

    this.mainPrompt = await this.fileUtil.readFileContent(
      path.join(
        __dirname,
        '..',
        'asset',
        'agi',
        'software-engineer',
        'backend',
        'senior-backend-engineer-nodejs-with-typescript-main.agi.md'
      )
    );

    this.nextPrompt = await this.fileUtil.readFileContent(
      path.join(
        __dirname,
        '..',
        'asset',
        'agi',
        'software-engineer',
        'backend',
        'senior-backend-engineer-nodejs-with-typescript-next.agi.md'
      )
    );

    // Set here the Action Util class which contains your AGI actions and implements Actionable
    this.actionUtil = new ActionUtil<ActionType>(
      this.loggerUtil,
      this.taskDir,
      this.ltmPath
    );
  }
}
```
3. Implement actions and action types needed regarding AGIs capacity. Do not forget to use your own ActionTypes here `MainAGI<ActionType>` which will be extended from ActionType.
4. Configure the environment parameters as mentioned in the [Repository Overview](#wrench-repository-overview) section.
5. Create .env file and set your environment configuration, and other necessary configurations.
6. Define input and start the AGI
```javascript
async function createContent(documentation: string): Promise<Content> {
  const environmentUtil = new EnvironmentUtil();
  const environment = environmentUtil.getEnvironmentInfo();
  console.log('Environment Information: ', environment);
  const userInteraction = new UserInteractionUtil();
  const applicationName = await userInteraction.getUserInput(
    'Enter your project name: '
  );
  const maxAttempt = Number.parseInt(process.env.MAX_ATTEMPT as string);

  return {
    input: documentation,
    name: applicationName,
    maxAttempt,
    environment,
  } as Content;
}

function createProvider(): any {
  const apiKey = process.env.API_KEY as string;
  const apiEndpoint = process.env.API_ENDPOINT as string;
  const apiVersion = process.env.API_VERSION as string;
  const maxToken = Number.parseInt(process.env.MAX_TOKEN as string);
  const maxRetryCount = Number.parseInt(process.env.MAX_RETRY_COUNT as string);
  const retryInterval = Number.parseInt(process.env.RETRY_INTERVAL as string);

  const provider = new OpenAIAzureProvider(
    apiKey,
    apiEndpoint,
    apiVersion,
    maxToken,
    maxRetryCount,
    retryInterval
  );

  return { provider, maxRetryCount, retryInterval };
}

async function backend() {
  const documentation = await new FileUtil().readFileContent(
    path.join(
      __dirname,
      'asset',
      'input',
      'backend-example-project-documentation.md'
    )
  );

  const content = await createContent(documentation);
  const { provider, maxRetryCount, maxRetryInterval } = createProvider();
  const agi = new SeniorBackendSoftwareEngineerAGI(
    provider,
    maxRetryCount,
    maxRetryInterval
  );

  agi.init();
  await agi.start(content);
}
```
7. Once you've set up everything, run `npm start` to kick off the AGI.
8. You can find example project here: [Senior Software Engineer AGI](https://github.com/pi-agi/senior-software-engineer)

## :wrench: Repository Overview

This repository serves as a comprehensive resource for delving into the realm of PI AGI, encompassing crucial environment parameters, AGI definitions, and detailed project documentation. We have meticulously curated and organized these materials to enable you to quickly grasp the core concepts, explore the underlying architecture, and kickstart your journey into the fascinating world of personalized Artificial General Intelligence. 
You can also check out the PI AGI Concept by following this [link](https://viewer.diagrams.net/?tags=%7B%7D&highlight=0000ff&edit=_blank&layers=1&nav=1&title=PI%20AGI%20Concept.drawio.png#R7VtbU9s4FP41mUl2BsaW748kUMpCGbbQ0j7tKLacaHGsrK2EpL9%2BJVm%2BKHYupSQxS2EmWEeKbOl85zsXmY4xmCwuEzgdfyIBijpACxYd47wDgGu47JMLlplA11yQSUYJDqSsFNzjHygfKKUzHKBUGUgJiSieqkKfxDHyqSKDSUKe1WEhidS7TuEI1QT3Pozq0kcc0LFcF3BK%2BUeER%2BP8zrrtZT0TmA%2BWK0nHMCDPFZFx0TEGCSE0u5osBijim5fvy%2BPV8jG6ebIv%2F%2Fwr%2FRd%2B6V8%2F3H49ySb78DNfKZaQoJi%2B7tRGNvUcRjO5Xx1gR%2Bwm%2FQDP2eWIX36COGaD7hIymbL2Gbs%2BRyGOmVr5NolOfwwT6FOU4JRin3eQkH2cXV51wIDDAM8RV%2F1YfML0ias3DvinuEbsa2zHMYmLjpSiKZ8oZPfNp8qejS2y8nhSO3SZqzwhszhAfNk6634eY4rup9Dnvc8M5Ew2ppNIdockphK1OlNpfxTBlENOY9cpTchTARs%2BusAA7w5xFA1IRBJxWyOwkBuYxdcqPS4YGrYtb%2FYBTnDErekjiuaIbRbkX2HPh%2BPRDQppfu9M0ieUsuUrss8SrhXRA5mqAv68vDlKYIAZbCpP4zmB5jj50uW25VtRGWee899ig7fCT8J0jhKKFhXjk3C8RGSCaLJkQ%2FJeS1pWzi2GbD%2BXhgpMKRtXjNSVMii5YVRMXeKfXUgTaDaH0fTvE10fe19vJ54FPzxe3zkLaUFbzOHy7uHE5IC8Y4DUuga47rUbmKHrI99vAubQtUxLa4BCA2wQtIcFiNfDpKb%2BXZGzFiaG4SkwsbU6TAooVWFi7gsmwKypFgXM68gmSeiYjEgMo4tS2i%2BVzze8HHNDhO3yXf8HUbqUOoczSlRAoAWm3yrX3%2FlUp5ZsnS%2FkzKKxzBsxW%2B%2B3ciBvfs%2Fn4I3ya6KVfy9bH1%2FUCzTJNobMEh9t2kEZCcBkhOiGcUYzMhIUMV8xVx%2Fu9dVs1eig6%2Fb%2BYJIv0wBS7slu0YKWrpGHBRkRDJOcBJ4xwyjQbmBKxYKfEPdwZ750dZ9ROotoWji9AZsoQhTx6%2FvMATYg7QYOWZimoANGeBSza58pCDHT7HNDZM4lOpMdExwEGRBRin%2FAoZiP63pKcEzF3ln9jnW%2B3THY4meTxctgTt6kDKGq%2BNlgWWupQDvVTdtS2CCH3M6QkJPf8VWXM%2BfT5LOatjoDCcOUIXUVUsUj%2FgLKnGOSiXbqWFU%2B2ZVNbPdn6ES07lhwyDaLg7NVHKM1Q%2B5AHOPWOcYWHHPJ4ZYTDKeCgiMy8nhvzOBsZIYTRg2KBYNXoYUVVrAORgrecUkBVElB35UU3mSIsQZXhzF%2Fo55xdB1h%2Fg8sUni3tu5ts3WWK6pJwSuFAcBQZ%2FUOZvA1HDRknldMp7JG0uZ8E9mBFqCmfNPzbN21mvPLwHIML6hXMH6uSrH%2F9NMxG9JPQ4aL1fTT3lf6uVPRTs1MVop2PpzCIY4wxWhtqS7KMpZEJChF7OFX8pO8QFet48XZbdMsXnkrpbsw9APgNiE2cLyhtltdLQyhpWkbEKoieU9wtWy1qGY0FdWMQxbVnF3gWvi5NsPk%2F0VsQAWK6R2b144c874oD25VyOvWQ971pz7HCnn1nPoqIa%2FeyxJe7k3U06Z3FfduDnu1U8327H1EvSeWGuKAg4W9utEem39Zmqu1z%2Bbbl%2BbqZt3mDW7z91DEmhf1019Z%2FOYBab2oLpPj7DT5KmZxLIzea7Ksr2HzSmHM1V3FvvdTMgcHK5nny2nB%2BduOnKEwhqyuvQHSOG6g4NVJw%2ByJ0ADxnWgggJXjuHdFA%2B6W4IGlhqYa8P8aCxQhyOFOyrRGlR7l2N3ZfO7eFgM%2B7tlWQ6QPuAGfiVLReqevhcxgcut%2BEIWl92TKYI3WSlPWwEr123gVj64Wv63DGTZoi2HvmgOo%2FvytuHNwVDaol627lsgB2HPT0pmvnnGUUT%2F7Cye8uBcPU%2F5Hvlrz2%2F0XJrSJMwwHqJzxOlnAShKg52reP2vU35xoOjLLwME54Hdp%2BWClZW%2F7GYTe9GKvtbcjs3ooIl%2Bp6dq9rMrQdXpFHNJ1e%2BJpxcRDTkuiJolLbtJmMcWRMB%2Foj%2FnWA%2FUd9mlC5jgQ52TDZcFu4iRsBXGUs5YCKxUDMYnRCmCkaHfqasKx6kC3UpemDQZ7hEzxtq7EjGvVMWNqDZgx9oYZUMOMeONb6FAbkNhHDV6mRdqUxOS2QLvGymGT23Ao2UQIL1Aua5b%2Fk5P5mvI%2Fm4yL%2FwA%3D).

### Environment Parameters

To get started with PI AGI, you'll need to configure the following environment parameters:

- `API_KEY`: Your Azure OpenAI Service API Key (either KEY1 or KEY2)
- `API_ENDPOINT`: Azure OpenAI Service Endpoint (https://your_service.openai.azure.com/openai/deployments/your_openai_model)
- `API_VERSION`: Azure OpenAI Service Version (2023-03-15-preview)
- `MAX_TOKEN`: Maximum token count for GPT-4-32K (32768)
- `MAX_ATTEMPT`: Maximum step count (100)
- `MAX_RETRY_COUNT`: Retry count for calling the GPT-4 API in case of rate limit or timeout (3)
- `RETRY_INTERVAL`: Retry interval for calling the GPT-4 API in case of rate limit or timeout (60000)

### Working Styles

Our AGIs function via a dynamic process of prompts and iterations, commencing with an initial call to delineate the task and obtain an estimation of the necessary API calls. As the AGI advances through the projected steps, it continuously adapts and fine-tunes its actions, drawing upon its inherent capabilities and the input it receives.

This flexible approach enables the AGI to learn and grow more proficient over time, evolving its strategies and techniques to better meet the needs of its specific role. By incorporating user feedback and adjusting its behavior in real-time, the AGI can deliver increasingly accurate and efficient results, ultimately maximizing its potential and value within its designated domain.

### Project Goal

The paramount objective of PI AGI is to lay the groundwork for the creation of personalized AGIs that can be employed across a diverse array of tasks and domains. By devising a scalable and flexible framework, we aim to galvanize others to participate in the project and propel innovation within the realm of Artificial General Intelligence.

Our vision encompasses fostering a thriving community of developers, researchers, and enthusiasts, all collaborating to enhance and expand the capabilities of PI AGI. By combining our collective expertise and insights, we can collectively push the boundaries of what AGI can achieve, ultimately benefiting industries, societies, and individuals worldwide.

## :star: Get Involved

We invite you to join us on this exciting journey by starring the repository, donating to support its development, or contributing your own code and ideas.

### Donations

Fuel the future of AI by [buying me a coffee](https://www.buymeacoffee.com/RwIpTEd) and helping to fund the project.

### Contributors

<table>
  <tr>
    <td align="center"><a href="https://github.com/fatihturker"><img src="https://avatars1.githubusercontent.com/u/2202179?s=460&u=261b1129e7106c067783cb022ab9999aad833bdc&v=4" width="100px;" alt=""/><br /><sub><b>Fatih Turker</b></sub></a><br /></td>
  </tr>
</table>

## :handshake: Join the Community

We believe that collaboration is the key to unlocking the true potential of AGI. By working together, we can create a better, more intelligent future for all. So don't hesitate to get involved, contribute your ideas, or share your thoughts with us.

We're looking forward to building the future of AI together!