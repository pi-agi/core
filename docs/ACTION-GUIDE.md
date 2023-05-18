# Action Guide - @pi-agi/core Library

This guide is dedicated to providing a comprehensive understanding of how to define actions in the @pi-agi/core library.

## Table of Contents

1. [Introduction](#introduction)
2. [Action Basics](#action-basics)
3. [Defining Actions](#defining-actions)
4. [Implementing Actionable Interface](#implementing-actionable-interface)
5. [Best Practices](#best-practices)
6. [FAQs](#faqs)

## Introduction

Actions are the fundamental building blocks of your AGI within the @pi-agi/core library. An action corresponds to a specific task or function that your AGI can perform.

## Action Basics

Every action in the @pi-agi/core library is associated with the `Actionable` interface. This interface provides a standardized way to define actions and ensure interoperability within the library.

## Defining Actions

In order to define an action, you'll need to create an `enum` or a `type` that includes the list of actions your AGI can perform. Here's a simple example:

```javascript
import { ActionType } from '@pi-agi/core';

export enum ComposeActionType {
  ADD_INSTRUMENT = 'addInstrument',
  ADD_NOTE = 'addNote',
  EXPORT_MIDI = 'exportMIDI',
}

export type MergedActionType = ActionType & ComposeActionType;
```

In this example, we've created an `enum` called `ComposeActionType` which includes the actions `ADD_INSTRUMENT`, `ADD_NOTE`, and `EXPORT_WAV`.

## Implementing Actionable Interface

The `Actionable` interface serves as a blueprint for creating action utilities. Each action utility must implement this interface and provide the `takeAction` method.

Here's a basic example:

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
        case ComposeActionType.EXPORT_MIDI:
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

## Best Practices

When defining actions and implementing the `Actionable` interface, here are a few best practices to follow:

- Be specific: Actions should be specific and clearly describe the task or function they perform.
- Keep it simple: Avoid overcomplicating your action definitions. Stick to the basics and expand as necessary.
- Test thoroughly: Make sure every action works as expected by writing and running tests.

## FAQs

### What is an action?

An action corresponds to a specific task or function that your AGI can perform.
