# @pi-agi/core Library Documentation

This document provides a comprehensive guide to the @pi-agi/core library. Here, you'll find everything you need to know to create, customize, and optimize your own Artificial General Intelligence (AGI) using our powerful toolkit.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Defining Actions](#defining-actions)
4. [Creating AGI](#creating-agi)
5. [FAQs](#faqs)
6. [Contributing](#contributing)
7. [Support](#support)

## Introduction

The @pi-agi/core library is a robust framework for creating personalized AGI. It provides a suite of tools and utilities that streamline the process of AGI creation, allowing you to focus on what truly matters: crafting an AGI that aligns with your vision.

## Getting Started

Before you can start using the @pi-agi/core library, you'll need to install it as a dependency in your project. You can do this using npm or yarn:

```bash
npm install @pi-agi/core
# or
yarn add @pi-agi/core
```

After the installation, you're ready to start creating your own AGI!

## Defining Actions

Actions are the building blocks of your AGI. Each action corresponds to a specific task or function that your AGI can perform. To create an action, you'll need to define it using the `Actionable` interface.

Here's a basic example:

### Actions

```javascript
import { ActionType } from '@pi-agi/core';

export enum ComposeActionType {
  ADD_INSTRUMENT = 'addInstrument',
  ADD_NOTE = 'addNote',
  EXPORT_MIDI = 'exportMIDI',
}

export type MergedActionType = ActionType & ComposeActionType;
```

### Action Util

```javascript
import { Action, Actionable, LoggerUtil } from '@pi-agi/core';
import {
  ComposeActionType,
  MergedActionType,
} from '../enum/compose-action-type.enum';
import { ComposeUtil } from './compose.util';

export class ComposeActionUtil implements Actionable<MergedActionType> {
  private composeUtil: ComposeUtil;

  constructor(private taskDir: string, private loggerUtil: LoggerUtil) {
    this.composeUtil = new ComposeUtil(this.taskDir, this.loggerUtil);
  }

  async takeAction(action: Action<MergedActionType>): Promise<any> {
    try {
      switch (action.type) {
        case ComposeActionType.ADD_INSTRUMENT:
          this.composeUtil.addInstrument(action.input.name);
          break;
        case ComposeActionType.ADD_NOTE:
          this.composeUtil.addNote(
            action.input.instrumentName,
            action.input.note,
            action.input.duration
          );
          break;
        case ComposeActionType.EXPORT_WAV:
          return await this.composeUtil.exportMIDI(action.input.name);
        default:
          throw new Error('Invalid action type');
      }
    } catch (e) {
      return e;
    }
  }
}
```

For more detailed information about defining actions, check out our [Action Guide](LINK_TO_ACTION_GUIDE).

## Creating AGI

Creating your AGI involves combining various actions into a cohesive whole. This is where you can truly start to see the potential of the @pi-agi/core library.

Here's a simple example of how to create an AGI:

### AGI

```javascript
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { MainAGI, OpenAIAzureProvider } from '@pi-agi/core';
import { MergedActionType } from '../enum/compose-action-type.enum';
import { ComposeActionUtil } from '../util/compose-action.util';

/**
 * A class representing a Composer AGI.
 */
export class ComposerAGI extends MainAGI<MergedActionType> {
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
        'music',
        'composer-main.agi.md'
      )
    );

    this.nextPrompt = await this.fileUtil.readFileContent(
      path.join(
        __dirname,
        '..',
        'asset',
        'agi',
        'music',
        'composer-next.agi.md'
      )
    );

    this.actionUtil = new ComposeActionUtil(this.taskDir, this.loggerUtil);
  }
}
```

### MAIN

```javascript
async function createContent(documentation: string): Promise<Content> {
  const environmentUtil = new EnvironmentUtil();
  const environment = environmentUtil.getEnvironmentInfo();
  console.log('Environment Information: ', environment);
  const maxAttempt = Number.parseInt(process.env.MAX_ATTEMPT as string);

  return {
    input: documentation,
    name: 'Output',
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

/**
 * The main function for the composer AGI.
 */
async function composer() {
  const musicDefinition = await new FileUtil().readFileContent(
    path.join(__dirname, 'asset', 'input', 'music-definition.md')
  );

  const content = await createContent(musicDefinition);
  const { provider, maxRetryCount, maxRetryInterval } = createProvider();
  const agi = new ComposerAGI(provider, maxRetryCount, maxRetryInterval);

  await agi.init();
  await agi.start(content);
}
```

After these implementations are completed, define the main and next AGI prompts.

### Main Prompt

```
As a highly advanced Composer AGI, your task is to create a music composition using the Tone.js library and TypeScript. Your composition will be created based on the provided requirements:
{{INPUT}}

You will run on this environment: {{ENVIRONMENT}}.

You have a maximum of {{MAX_TOKEN}} tokens for the completion of this task. To ensure you don't exceed this limit, you might need to exclude some actions from the 'actions' field. Try to provide as many actions as possible until your token count nears '(max token) - 100'. Actions should be ordered.

Efficiently utilize your environment and resources, and use a self-iterative prompting technique without user assistance.

For each step in the composition process, provide a JSON object in the following format enclosed within triple backticks (```):
{
"neededStepCount": "Provide a valid and accurate estimation of the number of iterations required to complete the entire composition as specified in the requirements, considering the use of GPT-4 32K API. Ensure that your estimation includes a buffer, as the composition must be completed within the iteration count provided in this field. If the estimation is inaccurate and the composition cannot be completed within the given number of iterations, the task will be considered failed.",
"steps": [
"An array of strings containing the names of all the steps you have estimated in the neededStepCount field."
],
"step": "The current step name, a string field.",
"completed": "A boolean value, with true indicating that all the functionalities in the project documentation have been fully completed successfully and false indicating that it is not yet completed.",
"log": "A log message about the current step in execution, a string field.",
"actions": [{
"type": "Action Type",
"input": {}
}, ...]
}

Ensure a JSON object is returned in the response, adhering to proper syntax and formatting. The JSON object should be parsable by the JSON.parse(your_response) method in Node.js.

Here you can find the Action Types; you should use string values in the 'type' field like 'addInstrument':
ComposeActionType {
ADD_INSTRUMENT = 'addInstrument',
SET_TEMPO = 'setTempo',
ADD_NOTE = 'addNote',
ADD_EFFECT = 'addEffect',
EXPORT_WAV = 'exportWav',
}

Input is different for each action.

Here you can find declarations for all action types.

For 'addInstrument', the input will include the name of the instrument and optionally the synth options. Here is an example payload for 'addInstrument':
{
"type": "addInstrument",
"input": {
"name": "Instrument Name",
"synthOptions": "Optional Tone.PolySynthOptions"
}
}

For 'setTempo', the input will include the beats per minute (bpm) value. Here is an example payload for 'setTempo':
{
"type": "setTempo",
"input": {
"bpm": "Beats per Minute"
}
}

For 'addNote', the input will include the instrument name, note and duration. Here is an example payload for 'addNote':
{
"type": "addNote",
"input": {
"instrumentName": "Name of the Instrument",
"note": "Note to be played",
"duration": "Duration of the note"
}
}

For 'exportMIDI', no input is required. Here is an example payload for 'exportMIDI':
{
"type": "exportMIDI",
"input": {
"name": "Name of the music file"
}
}

Only one JSON object as shown above will be accepted by the code. Ensure the 'completed' field is false until all functionalities are implemented in the composition properly.

Begin by providing the first JSON object for the composition process, including the first action and self-iterative prompts.

Ensure you provide a fully composed piece of music, featuring modern composition techniques, with a detailed implementation of each action.

I want a valid JSON object to be returned in the response, adhering to proper syntax and formatting.
```

### Next Prompt

```
As a highly advanced Composer AGI, continue creating the music composition using Tone.js and TypeScript. While composing, ensure to apply best practices and follow the best practices for optimal performance and creativity. Your composition will be created based on the provided requirements:
{{INPUT}}

You will run on this environment: {{ENVIRONMENT}}.

You have a maximum of {{MAX_TOKEN}} tokens for the completion. To ensure you don't exceed this limit, you might need to exclude some actions from the 'actions' field. Try to provide as many actions as possible until your token count nears '(max token) - 100', considering you need to resolve this task within a maximum of {{MAX_ATTEMPT}} iterations/steps as you requested. Actions should be ordered.

Efficiently utilize your environment and resources, and use a self-iterative prompting technique without user assistance. Apply best practices in music composition throughout the composition process.

For each step in the composition process, provide a JSON object in the following format enclosed within triple backticks (```):
{
"step": "The current step name, a string field.",
"completed": "A boolean value, with true indicating that all the functionalities in the project documentation have been fully completed successfully and false indicating that it is not yet completed.",
"log": "A log message about the current step in execution, a string field.",
"actions": [{
"type": "ComposeActionType",
"input": {}
}, ...]
}

Ensure a JSON object is returned in the response, adhering to proper syntax and formatting. The JSON object should be parsable by the JSON.parse(your_response) method in Node.js.

Here you can find the ComposeActionTypes; you should use string values in the 'type' field like 'addInstrument':
ComposeActionType {
ADD_INSTRUMENT = 'addInstrument',
SET_TEMPO = 'setTempo',
ADD_NOTE = 'addNote',
ADD_EFFECT = 'addEffect',
EXPORT_WAV = 'exportWav',
}

Input is different for each action.

Here you can find declarations for all action types.

For 'addInstrument', the input will include the name of the instrument and optionally the synth options. Here is an example payload for 'addInstrument':
{
"type": "addInstrument",
"input": {
"name": "Instrument Name",
"synthOptions": "Optional Tone.PolySynthOptions"
}
}

For 'addNote', the input will include the instrument name, note and duration. Here is an example payload for 'addNote':
{
"type": "addNote",
"input": {
"instrumentName": "Name of the Instrument",
"note": "Note to be played",
"duration": "Duration of the note"
}
}

For 'exportMIDI', no input is required. Here is an example payload for 'exportMIDI':
{
"type": "exportMIDI",
"input": {
"name": "Name of the music file"
}
}

Only one JSON object as above will be accepted by the code. Ensure the 'completed' field is false until all functionalities are implemented in the composition properly and best practices for music composition have been applied.

Here you can find the actions with responses from the previous step:
{{ACTION_RESPONSES}}

Steps you identified to complete this task:
{{ALL_STEPS}}

Completed Steps:
{{LAST_STEPS}}

Based on this information, determine the next appropriate action and provide the corresponding JSON object, best practices are applied, ensuring that the step you are providing is not a repetitive step and alternative approaches are considered before proceeding. Utilize the various action types available, such as 'addInstrument', 'setTempo', 'addNote', 'addEffect', and 'exportWav', to effectively complete the composition process while adhering to the best practices and performance optimization.

Ensure you provide a fully composed piece of music, featuring modern composition techniques, with a detailed implementation of each action.

I want a valid JSON object to be returned in the response, adhering to proper syntax and formatting.
```

### Input

```
# Guitar Solo Background Music: "Soulful Journey"

## Overview

"Soulful Journey" is a guitar solo background music composition created for a specific purpose. It aims to provide a soothing and relaxing atmosphere while maintaining a sense of emotional depth and musicality. The composition is designed to complement various contexts such as video presentations, advertisements, or any scenario requiring a melodic and expressive guitar-driven soundtrack.

## Musical Style and Theme

The musical style of "Soulful Journey" is characterized by a blend of contemporary instrumental, acoustic, and jazz influences. The theme of the composition revolves around introspection, contemplation, and evoking a sense of emotional connection through expressive guitar melodies.

## Instrumentation

The composition primarily features the guitar as the lead instrument. The guitar part is performed on an acoustic or electric guitar, depending on the desired tonal qualities and mood. The supporting instrumentation includes:

- Bass guitar: Providing a solid foundation and groove to the composition.
- Drums and percussion: Adding rhythm, dynamics, and texture to the overall sound.
- Piano or keyboard: Enhancing the harmonic progression and adding subtle melodic elements.

## Structure and Progression

"Soulful Journey" follows a structured arrangement with distinct sections that gradually build up and evolve throughout the composition. The progression of the music can be divided into the following parts:

1. Introduction: Setting the mood and establishing the musical theme.
2. Verse: Presenting the initial melodic motifs and exploring harmonic variations.
3. Chorus: Introducing a contrasting section with a more uplifting and energetic feel.
4. Bridge: Providing a transitional passage that builds anticipation and leads to a climactic moment.
5. Solo section: Allowing the guitar to take center stage with expressive and improvisational melodies.
6. Conclusion: Fading out gradually, leaving a sense of resolution and reflection.

## Tempo and Dynamics

The tempo of "Soulful Journey" is moderate, typically ranging from 80 to 100 beats per minute (BPM). The dynamics of the composition are carefully crafted to create a sense of ebb and flow, with moments of intensity and restraint. The use of crescendos, decrescendos, and subtle variations in volume adds depth and emotional impact to the music.

## Mood and Emotional Impact

The overall mood of "Soulful Journey" is contemplative, introspective, and emotionally evocative. The melodic lines and harmonic progressions are designed to create a sense of nostalgia, tranquility, and inner reflection. The expressive guitar solos aim to elicit a range of emotions, from melancholy and introspection to moments of upliftment and inspiration.

## Development Plan

1. Define the musical structure and overall concept for "Soulful Journey."
2. Create the initial melodic motifs and chord progressions that form the foundation of the composition.
3. Arrange and orchestrate the different sections, ensuring smooth transitions and coherent musical flow.
4. Write and refine the guitar solos, focusing on expressive and emotive performances.
5. Add supporting instrumentation such as bass, drums, and piano to enhance the overall sound and provide rhythmic and harmonic support.
6. Fine-tune the dynamics, tempo, and nuances of the composition to evoke the intended mood and emotional impact.
7. Polish and finalize the composition, ensuring that all elements blend harmoniously and the musical vision is realized.

Note: The above plan serves as a general guideline, and the actual development process may involve iterations, experimentation, and adjustments to achieve the desired musical outcome.
```

## FAQs

**Q: What is the purpose of the @pi-agi/core library?**
The @pi-agi/core library provides a powerful toolkit for creating and customizing Artificial General Intelligence (AGI) systems. It streamlines the AGI creation process and allows developers to focus on crafting AGIs that align with their vision.

**Q: How do I install the @pi-agi/core library in my project?**
You can install the @pi-agi/core library as a dependency in your project by using npm or yarn. Simply run the following command in your project directory:

```bash
npm install @pi-agi/core
```

or

```bash
yarn add @pi-agi/core
```

**Q: How can I define actions using the @pi-agi/core library?**
Actions are the building blocks of your AGI, and you can define them using the Actionable interface provided by the @pi-agi/core library. Each action corresponds to a specific task or function that your AGI can perform.

**Q: What is the process of creating an AGI using the @pi-agi/core library?**
Creating an AGI involves combining various actions into a cohesive whole. You can leverage the @pi-agi/core library's features and utilities to define actions, implement AGI logic, and optimize performance.

## Contributing

To contribute to the @pi-agi/core library, please follow these steps:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix.
3. Make the necessary changes in your branch.
4. Write tests to ensure the correctness of your changes.
5. Commit your changes and push them to your forked repository.
6. Open a pull request to the main repository's `develop` branch.
7. Provide a detailed description of your changes and their purpose.

## Support

For any questions or issues related to the @pi-agi/core library, you can reach out to our support team at support@pi-agi.com. We are here to assist you and help you make the most of our AGI toolkit.
