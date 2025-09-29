---
title: "394. Decode String"
date: 2025-09-04
tags: ["neetcode", "stack", "string"]
---

# 394. Decode String

## 題目

> 💡 [Leetcode 394](https://leetcode.com/problems/decode-string/)

給定一個只包含數字（k）、字母（s）和方括號的字串，請將其解碼。

- 可以假定必定包含這三個種類的數值，不用處理例外狀況。

```
Input: s = "3[a]2[bc]"
Output: "aaabcbc"
```

## 解題思路

> 老實說一開始的思緒比較複雜，起初有點在糾結忘記怎麼取字串的某個值，後來發現用小白版紀錄 Pseudo Code 還滿有用的。

![Leetcode 394](/img/notes/neetcode/394-decode-string.jpg)

### 巢狀結構的處理

以複雜例子 `2[a[2[c]]]` 來說明，一開始想到比較麻煩的是去處理巢狀的狀況：

1. 需要先把 `2[c]` 解碼成 `cc`
2. 接著 `a` + `cc` = `acc`
3. 最後將 `2[acc]` 解碼成 `accacc`

很明顯後發生的事情要先處理，很像是 Stack 後進先出的結構！

### 演算法設計

```js
var decodeString = function (s) {
  let output = "";
  let stack = [];

   for(chr of s){...}
}
```

### 核心決策

接著要決定的事情是：

- **push()**：要把哪些事情加入物件？
- **pop()**：Stack 取出時會發生哪些事情？

這邊透過上面的小白版還原就比較清楚

![Leetcode 394](/img/notes/neetcode/394-decode-string.jpg)

```plaintext
output="" k=2 prevString = ""
output="" k=2 prevString = "a"
output="c"
```

- `prevString`：當前層級的字串
- `k`：倍數
- `output`：目前正在建構子字串

還原的佇列就會變成

1. output 還原成 `a` + 2 × `c` = `acc`
2. 接著 `acc` × 2 = `accacc`

### 實作邏輯

- 狀況 1：如果是 0~9 更新倍數的值
- 狀況 2：如果遇到 `[` 會把工作加入佇列（push）、初始化`k`及 `output`，直到內層結構被處理完。
- 狀況 3：如果遇到 `]` 代表沒有內層結構了，開始還原值。
- 狀況 4：遇到字母 → 直接加入當前字串

```js
var decodeString = function (s) {
  let output = "";

  let stack = [];
  let k = 0;

  for (chr of s) {
    if ("0" <= chr && chr <= "9") {
      k = k * 10 + Number(chr);
    } else if (chr === "[") {
      stack.push({ k: k, prevString: output });

      output = "";
      k = 0;
    } else if (chr === "]") {
      const obj = stack.pop();
      output = obj.prevString + output.repeat(obj.k);
    } else {
      output += chr;
    }
  }

  return output;
};
```
