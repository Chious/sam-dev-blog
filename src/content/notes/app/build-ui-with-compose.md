---
title: 【Compose】Build UI with Compose
sidebar_position: 2
---

## Build UI with Compose

> `Font` is Property of compose

```kotlin

@Composable
fun Offer(){

   val style = TextStyle(
      fontFamily = FontFamily.Default,
      fontWeight = FontWeight.Normal,
      fontSize = 20.sp
   )

   Column(
      modifier = Modifier.padding(16.dp)
      horizontalAlignment = Alignment.CenterHorizontally
   ){
      Text(text = "Offer", fontSize = 20.sp)

      Spacer(modifier = Modifier.height(8.dp)) // 像是 HTML 中的 <br>

      Text(text = "Offer", fontSize = 20.sp,
      style=MaterialTheme.typography.h1
      )
   }
}
```

![image](/img/notes/kotlin/kotlin-compose-styling-example.png)

### 如何管理 UI 的樣式

```java
// ui.theme Type

val Typography = Typography(
   body1 = TextStyle(
      fontFamily = FontFamily.Default,
      fontWeight = FontWeight.Normal,
      fontSize = 16.sp
   )

   body2 = TextStyle(
      fontFamily = FontFamily.Default,
      fontWeight = FontWeight.Normal,
      fontSize = 14.sp
   )

   h1 = TextStyle(
      fontFamily = FontFamily.Default,
      fontWeight = FontWeight.Normal,
      fontSize = 20.sp
   )
)

```

## 定義顏色

```java
// Colors are in ARGB format (A for Alpha, so FF is full opaque)
val Primary = Color(0xFF43281C)
val Secondary = Color(0xFF333D29)
val Ternary = Color(0xFF7F4F24)
val Alternative1 = Color(0xFFB08968)
val Alternative2 = Color(0xFFDDB892)
val CardBackground = Color(0xFFEDE0D4)
val SurfaceBackground = Color(0xFFEFEFEF)
```
