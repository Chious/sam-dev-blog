---
title: Websocket & Heartbeat 實作
tags: [Internet, Websocket]
sidebar_label: Websocket & Heartbeat 實作
sidebar_position: 1
---

在前幾個月的專案，需要用 WebSocket 來廣播共同訊息，但是因為網路不好，導致有時候會斷線，然後就會看到很多人都在『F5』刷新訊息。或是因為太久沒有操作，導致斷線。後來也在思考如何做會比較好，因此有了這篇筆記。

## 目錄

- [一、Websocket vs HTTP](#websocket-vs-http)
- [二、Socket vs Websocket vs Socket.io](#socket-vs-websocket-vs-socketio)
- [三、實作：以 Websocket 為例](#實作以-websocket-為例)
- [四、如何避免失去連線？Heartbeat！](#如何避免失去連線heartbeat)

## Websocket vs HTTP

> 通訊協定：白話來說，就是指在網路溝通時，確保雙方能夠正確收到訊息，因此制定的通訊規則。

如果回到讓人很頭痛的網路概論，大概還記得 TCP/IP 等通訊模型：

- 1. 應用層：例如 HTTP（文本）/FTP（檔案傳送）
- 2. 傳輸層：例如 TCP（可靠）/UDP（不可靠）
- 3. 網路層：例如 IP（路由）
- 4. 連結層：例如乙太網路

而 HTTP 是基於 TCP 的應用層協定，短暫建立請求後，就會斷開連線。但像是聊天室、遊戲等，需要由伺服器主動推送訊息，這時候就需要 Websocket 這個協定。

:::note Websocket vs HTTP
| 特性 | WebSocket | HTTP |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| 連接方式 | 持久連接，雙向通信 | 短連接，請求-回應模式 |
| 通信效率 | 高，因為連接持久且無需每次都建立新連接 | 低，每次請求都需建立新連接 |
| 延遲 | 低，適合實時應用 | 高，不適合實時應用 |
| 資源消耗 | 低，因為連接持久且無需頻繁建立和關閉連接 | 高，因為每次請求都需建立和關閉連接 |
| 使用情境 | 即時聊天、遊戲、股票行情、實時通知等需要實時數據更新的應用 | 網頁瀏覽、文件下載、API 請求等不需要實時數據更新的應用 |
| 安全性 | 需要額外的安全措施來防止攻擊（如 XSS、CSRF） | 通過 HTTPS 提供內建的安全性 |
| 瀏覽器支持 | 現代瀏覽器均支持 | 所有瀏覽器均支持 |
| 協議 | ws:// 或 wss:// | http:// 或 https:// |
| 數據格式 | 任意格式（如 JSON、XML、二進制數據等） | 主要是文本格式（如 HTML、JSON 等） |
:::

## Socket vs Websocket vs Socket.io

> 在前後端實作 socket 時，首先要確保前後端的通訊協定一致，然後再進行協作。

:::note Socket vs WebSocket vs Socket.io
| 特性 | Socket | WebSocket | Socket.io |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| 定義 | 低層次的網路通信接口 | 基於 TCP 的應用層協定 | WebSocket 的封裝庫，提供更高層次的 API |
| 連接方式 | 需要手動管理連接 | 持久連接，雙向通信 | 持久連接，雙向通信 |
| 通信效率 | 高 | 高 | 高 |
| 使用難度 | 高，需要處理底層細節 | 中等，需要處理協定細節 | 低，封裝了很多細節 |
| 瀏覽器支持 | 不直接支持 | 現代瀏覽器均支持 | 現代瀏覽器均支持 |
| 資源消耗 | 低 | 低 | 低 |
| 使用情境 | 低層次網路通信 | 即時聊天、遊戲、股票行情、實時通知等需要實時數據更新的應用 | 即時聊天、遊戲、股票行情、實時通知等需要實時數據更新的應用 |
| 安全性 | 需要額外的安全措施 | 需要額外的安全措施 | 提供內建的安全措施 |
| 數據格式 | 任意格式 | 任意格式 | 任意格式 |
:::

## 實作：以 Websocket 為例

## 如何避免失去連線？Heartbeat！

> 在前幾個月的專案，需要用 WebSocket 來廣播共同訊息，但是因為網路不好，導致有時候會斷線，然後就會看到很多人都在『F5』刷新訊息。或是因為太久沒有操作，導致斷線。後來也在思考如何做會比較好。

### 概念介紹

如果參考 [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#pings_and_pongs_the_heartbeat_of_websockets) 的文章，可以看到有一個 `ping` 和 `pong` 的機制，這個機制可以用來確保連線是否還在，如果沒有收到 `pong` 就可以重新連線。

既然 WebSocket 很容易掉封包，那麼 `Heartbeat` 就是由前端主動發起的監控方式，來確保使用者的連線狀態。

下面是前後端實作需要注意的地方：

#### `前端`

1. 主動發起 `ping` 請求（大約間隔 30 - 60 秒鐘）。

   - 通常 `ping` 的訊息會很簡短。

2. 檢測是否收到`pong` 回應
   - 設定等待 pong 回應的超時時間(通常 3-5 秒)
   - 沒收到回應要有重試機制
   - 達到重試上限要斷開重連

#### `後端`

1. 收到 `ping` 請求後，回應 `pong`。

:::note
心跳的頻率可以根據實際情況調整，如果是網路訊號差的環境，可以提高心跳的頻率，但相對而言會增加伺服器的負擔。
:::

### 實作

:::note
這邊準備了一個簡單的範例，可以參考 [Github](https://github.com/Chious/websocket-heartbeat?tab=readme-ov-file#start-with-docker)，可以使用 `docker-compose` 的方式來啟動。
:::

![websocket-chatroom](/img/notes/websocket-chatroom.png)

> 可以透過 `ws://localhost:3000` 來連線，並透過聊天室傳送訊息。

![websocket-heartbeat](/img/notes/websocket-heartbeat.png)

> 每過 30 秒，會在 `Message` 看到 `pong`，代表從後端收到回應。

#### `後端`

<details>
<summary>點擊查看後端程式碼</summary>
```javascript
// index.js
const app = require('express');
const server = require('http').createServer(app);

const wss = new WebSocket.Server({ server });

// 存儲所有連接的客戶端
const clients = new Map();

wss.on('connection', ws => {
const clientId = Date.now();
clients.set(clientId, {
ws,
isAlive: true,
lastHeartbeat: Date.now(),
});

// 處理接收到的消息
ws.on('message', message => {
const data = message.toString();

    if (data === 'ping') {
      // 回應心跳
      ws.send('pong');
      clients.get(clientId).lastHeartbeat = Date.now();
      clients.get(clientId).isAlive = true;
    } else {
      // 廣播消息給所有客戶端
      broadcastMessage(data, clientId);
    }

});

// 處理連接關閉
ws.on('close', () => {
clients.delete(clientId);
});

// 處理錯誤
ws.on('error', error => {
console.error(`Client ${clientId} error:`, error);
clients.delete(clientId);
});
});

`````
</details>


#### `前端`

:::note
React 的 WebSocket 實作可以參考 [useEffect](https://react.dev/reference/react/useEffect)

`useEffect` is a React Hook that lets you [synchronize a component with an external system.](https://react.dev/learn/synchronizing-with-effects)

:::

<details>
  <summary>WebSocket</summary>
````javascript
export const useWs = (url: string) => {
  const [isReady, setIsReady] = useState(false);
  const [val, setVal] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsReady(true);
    };

    ws.onmessage = (event) => {
      setVal(event.data);
    };

    ws.onclose = () => {
      setIsReady(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const send = (message: string) => {
    if (isReady) {
      val.send(message);
    }
  };

  return [isReady, val, send]; // return 這三種hook方法（isReady: 是否連線, val: 聊天室傳送的值, send: 傳送訊息的方法）
`````

</details>

<details>
  <summary>WebSocket with Heartbeat</summary>
````javascript
export const useWs = (url: string) => {
  const [isReady, setIsReady] = useState(false);
  const [val, setVal] = useState<any>(null);

useEffect(() => {
const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsReady(true);
    };

    ws.onmessage = (event) => {
      setVal(event.data);
    };

    ws.onclose = () => {
      setIsReady(false);
    };

    startHeartbeat(); // add heartbeat

    return () => {
      ws.close();
    };

}, []);

// add heartbeat

    const startHeartbeat = () => {
    heartbeatInterval.current = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send('ping');
      }
    }, 30000); // 30 seconds

};

const stopHeartbeat = () => {
clearInterval(heartbeatInterval.current);
};

`````

</details>

<details>
  <summary>App</summary>
````javascript
const App = () => {
  const [isReady, val, send] = useWs('ws://localhost:3000');

const handleSend = () => {
if (isReady) {
val.send(message);
setMessage('');
}
};

return (

<div>
  <input
    type="text"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
  />
  <button onClick={handleSend}>Send</button>
  <div>
    {isReady ? 'Connected' : 'Disconnected'} // 顯示連線狀態
  </div>
  <div>
    {val} // 顯示收到的訊息
  </div>
</div>
)

````
</details>

## 參考資料

1. [Writing WebSocket servers](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#pings_and_pongs_the_heartbeat_of_websockets)
`````
