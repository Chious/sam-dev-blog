---
slug: first-try-android
title: Android 採坑紀錄
tags: [Android, Kotlin]
---

## 動機

近期因為專案的需求，需要跨平台去寫一個 Android 的套件，對我來說是第一次跨 Javascript 到其他環境開發，這篇文章想簡單記錄從 0 經驗的採坑過程。

<!--truncate -->

## 目錄

## 要解決的問題

- 這個是目前既有的 APP ，目前需要做的是針對右邊的 plugin 寫一個 UI。
- 這個 UI 能夠與例如 `com.example.plugin.maps.Marker` 同時也能夠使用 Android API、呼叫 RESTful API。
- 既有的範本只有很舊的 Java + XML，同時沒有完整的技術文件。

## First Try：Kotlin + Jetpack Compose

> 由於一開始光是拆開整個 純 Java + XML 的結構檔，整個人就看到頭昏眼花，加上引用方式、語法跟 React 天差地遠，因此選擇了 Android Studio 的範本，大概花了一個下午的時間起了一個基礎的 RESTful API + Layout 的專案。

![image](/img/notes/kotlin/kotlin-compose-styling-example.png)

:::note

1. 如何切出一個 UI 物件？ `Jetpack Compose`、`Material 3`、`xml檔`
2. 如何為物件寫 style、layout？ `Modifier`、`theme`、`xml檔`
3. 如何為物件設定狀態、資料流、Handle 使用者的 OnClick 事件？ `Jetpack Compose`、`MVVM`
4. 如何串接 API，並完成 RESTful 的邏輯？
5. 如何把 release、debug 推到使用者/測試機上？

:::

### Oh No 是環境建置錯誤：Gradle 與 Build Error!!

剛開始使用 Android Studio 的時候，發現每次都會透過 Gradle 來建立好編譯的環境，然後才開始開發。

## 下一步：開發目前既有的專案

**Kotlin**

- 相較於 Java 語法較為簡潔、比較貼近 Typescript，可以在支援 Java 的同時，也能比較快上手語言的邏輯。
- 當代的 Android 開發者、教材已經很多用 Kotlin 了，所以會比較好找到資源

```kotlin

class MainActivity: AppCompatActivity() {

  private lateinit var binding: ActivityMainBinding
  private val viewModel: MainViewModel by viewModels()

  fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(saveInstanceState)

        // data binding
        binding = LoginLayoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // set view model
        // Connect ViewModel to the binding
        binding.viewModel = viewModel
        binding.lifecycleOwner = this
  }
}

```

## 結語

> 對於工程師來說，最重要的價值是什麼？

在 AI 出現之後，我也一直在思考這個問題。『與其去追求一直在變的技術，CP 值最高的還是去學習語言的底層邏輯、設計模式』，之前總是從比較有經驗的工程師聽到這句話，但當時不太懂這句話的涵義。

## 參考資料

1. [【Medium】Android 四大組件 — Service 介紹](https://medium.com/@volume98910107/android四大組件-service介紹-f5620a376ba)
2. [【Google】Android 基本概念：使用 Compose](https://developer.android.com/courses/android-basics-compose/course?hl=zh-tw)
3. [【Google】現代化 Android 應用程式的架構](https://developer.android.com/courses/pathways/android-architecture?hl=zh-tw)
4. [【Medium】How to migrate Kotlin DSL](https://medium.com/工程師求生指南-sofware-engineer-survival-guide/how-to-migrate-kotlin-dsl-b857c153526d)
