---
title: 【Compose】Jetpack Compose
sidebar_position: 1
---

## 利用 Compose 宣告一個 UI 物件

```kotlin
@Composable
fun MyText(text: String) {
    Text(
        text = text,
        modifier = Modifier
            .background(Color.Yellow) // 設定背景顏色為黃色
            .padding(16.dp) // 設定內邊距為 16 dp
            .clickable { /* 處理點擊事件 */ } // 設定點擊事件
    )
}
```

## 利用 `Modifier` 來設定 UI 物件的樣式

- background：設定背景顏色。
- padding：設定內邊距。
- size：設定尺寸。
- fillMaxSize：填滿父元件的空間。
- clickable：偵測點擊事件。
- scrollable：讓元件可以捲動。

## State：如何接住 UI 物件的狀態

```kotlin

@Composable
fun MyText(text: String) {

   var name = remember{ mutableStateOf("")}

    Text(
        text = "Hello $name.value",
        modifier = Modifier
            .background(Color.Yellow) // 設定背景顏色為黃色
            .padding(16.dp) // 設定內邊距為 16 dp
            .clickable { /* 處理點擊事件 */ } // 設定點擊事件
    )

    TextField(
       value = name.value,
       onValueChange = { name.value = it },
    )
}

```
