---
title: 什麼是 AI Agent？
tags: [AI, Agent]
---

:::note
這個是關於 Build and Deploy AI Agent 的課程筆記。
Build an AI Agent for Scratch: Introduction
:::

## 什麼是 AI Agent？

AI Agent 是一個能夠自主學習、自主思考、自主行動的智能體。它能夠感知環境、理解環境、並且根據環境的變化做出反應。AI Agent 通常是一個軟體程式，但也可以是一個機器人、一個無人機、一個自動駕駛汽車等等。

## Intro

## Memory

> AI 的產出是基於模型去計算的，根據不同的需求，應該使用不同的模型，以達到省錢的效果。

#### One-Off Pattern

```typescript
const generateDescription = async (topic: string) => {
  return await llm.complete(`Write a description of ${topic}`);
};
```

- Agent based AI
  - Lower cost for one-off tasks
  - No context required

#### Chat Pattern

```typescript
const chatHandler = async (message: string, context: ChatMessage[]) => {
  const res = await llm.chat([
    ...context,
    {
      role: 'user',
      content: message,
    },
  ]);

  return [
    ...context,
    {
      role: 'user',
      content: message,
    },
    {
      role: 'assistant',
      content: res,
    },
  ];
};
```

- Chat based AI
  - Higher cost for long conversation
  - Requires context over time

#### Message Type

```typescript
// System message - Sets behavior of the AI
{
  role: 'system',
  content: 'You are now in the chat mode',
}

// User messages -- user input
{
  role: 'user',
  content: 'What is the weather today?',
}

// Assistant messages -- LLM response
{
  role: 'assistant',
  content: 'The weather today is sunny with a high of 75 degrees',
  tool_calls:[...]
}

// Tool messages -- Function results
{
  role: 'tool',
  content: '{"weather": "sunny", "temperature": 75}',
}
```

#### 限制

##### 1. Token Limit

- 使用者可能不在乎一個月前的事情，但是過去的對話紀錄會佔用記憶體。因此可以 summary 過去的對話紀錄，只保留重要的部分。
