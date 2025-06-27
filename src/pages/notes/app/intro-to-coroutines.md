---
title: 【Kotlin】非同步處理與 Coroutines
sidebar_position: 3
---

## 為什麼需要 Coroutines

想像現在有一段程式碼

```kotlin
fun main() {
    println("Feed Cat")
    println("Clean House")
    println("Feed Cat")
    println("Feed Cat")
}

main()
```

### 非同步處理

```kotlin
sealed class Result<out R> {
    data class Success<out T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
}

class LoginRepository(private val responseParser: LoginResponseParser) {
    private const val loginUrl = "https://example.com/login"

    // Function that makes the network request, blocking the current thread
    fun makeLoginRequest(
        jsonBody: String
    ): Result<LoginResponse> {
        val url = URL(loginUrl)
        (url.openConnection() as? HttpURLConnection)?.run {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json; utf-8")
            setRequestProperty("Accept", "application/json")
            doOutput = true
            outputStream.write(jsonBody.toByteArray())
            return Result.Success(responseParser.parse(inputStream))
        }
        return Result.Error(Exception("Cannot open HttpURLConnection"))
    }
}
```

這是一個 HTTP Request 的方法，如果在 main thread 直接執行會造成阻塞，並讓畫面上的 UI 互動，直到收到回應。

因此 Kotlin 可以使用 `coroutines` 來處理這個問題，可以宣告一個輕量化的子執行緒（IO），並在背景執行 HTTP Request 的方法，這樣就不會阻塞 UI 畫面了。

## 如何使用 Coroutines

- `suspend` 函數：用來宣告一個可以被中斷的函數。
- `launch`, `async` 函數：用來啟動一個新的子執行緒。
- `withContext` 函數：用來切換到指定的執行緒。

首先在我們的 `LoginRepository`

```kotlin
class LoginRepository(private val responseParser: LoginResponseParser) {

    suspend fun makeLoginRequest(
    ): Result<LoginResponse> {
        return withContext(Dispatchers.IO) {
         val url = URL(loginUrl)
         (url.openConnection() as? HttpURLConnection)?.run {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json; utf-8")
            setRequestProperty("Accept", "application/json")
            doOutput = true
            outputStream.write(jsonBody.toByteArray())
            return Result.Success(responseParser.parse(inputStream))
        }
            return Result.Error(Exception("Cannot open HttpURLConnection"))
        }
    }
}
```

`LoginViewModel`

```kotlin
class LoginViewModel(private val loginRepository: LoginRepository) : ViewModel() {
    fun login(username: String, password: String) {
        viewModelScope.launch {
            val result = loginRepository.makeLoginRequest(username, password)
        }
    }
}
```

`login_layount.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".LoginActivity">

    <EditText
        android:id="@+id/username"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inputType="text"
        android:hint="Username"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent" />

    <EditText
        android:id="@+id/password"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inputType="text"
        android:hint="Password"
        app:layout_constraintTop_toBottomOf="@+id/username"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent" />

    <Button
        android:id="@+id/login"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Login"
        app:layout_constraintTop_toBottomOf="@+id/password"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent" />

</LinearLayout>
```

`login_activity.kt`

```kotlin
class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login_layout)

       val
    }
}


## 參考資料

1. [Additional resources for Kotlin coroutines and flow](https://developer.android.com/kotlin/coroutines/additional-resources)
```
