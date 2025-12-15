---
title: 【周間札記】Kaplay： A Colyseus-based multiplayer game
tags: ["Game", "Multiplayer", "Colyseus"]
---

## 前言

As a frontend devlpoer, I'm engage to eye-attraced UI or animation. Compared with Web Developer, I found that game developer has a special taste, and build up lively animation easily, and it bring me to [JSLegendDev's Video](https://www.youtube.com/@JSLegendDev), and found [How to make a multiplayer game with Colyseus and KAPLAY](https://kaplayjs.com/docs/guides/how-to-make-a-multiplayer-game-with-colyseus-and-kaplay/) from offical document.

## What's KAPLAY

```plaintext
/src
|--objects
|--sences
| App.ts
```

![](@assets/keplay-sence.png)

## Colyseus

If don't using framework, i would seutup websocket manually like:

`client`

```js
const socket = new WebSocket("ws://localhost:8080");

socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
});
```

and we would desgin error handling by ourself, like: if user is disconnected, if user is leave the room ...

but `Colyseus` build in some common usage like `onAdd`, `onRemove`:

```js
import { getStateCallbacks } from "colyseus.js";

const $ = getStateCallbacks(room);

// listen when a player is added on server state
$(room.state).players.onAdd(async (player, sessionId) => {
  spritesBySessionId[sessionId] = await createPlayer(room, player);
});

// listen when a player is removed from server state
$(room.state).players.onRemove((player, sessionId) => {
  k.destroy(spritesBySessionId[sessionId]);
});
```
