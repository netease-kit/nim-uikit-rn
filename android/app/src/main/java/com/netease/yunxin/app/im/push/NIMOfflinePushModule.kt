package com.netease.yunxin.app.im.push

import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.module.annotations.ReactModule
import com.huawei.hms.aaid.HmsInstanceId
import org.json.JSONObject
import java.util.Locale
import java.util.UUID

private const val MODULE_NAME = "V2NIMOfflinePushPlugin"
private const val EVENT_REGISTER = "register"
private const val EVENT_REGISTRATION_ERROR = "registrationError"
private const val HUAWEI_PUSH_TYPE = "6"

@ReactModule(name = MODULE_NAME)
class NIMOfflinePushModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  private var initializedConfig: JSONObject? = null

  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun init(configJson: String, callback: Callback) {
    initializedConfig =
      runCatching { JSONObject(configJson) }
        .getOrElse {
          callback.invoke(null, null, null)
          null
        }

    val hwCertificateName = initializedConfig?.optString("hwCertificateName").orEmpty()
    val hwToken = runCatching { getHuaweiPushToken() }.getOrNull()

    if (hwCertificateName.isNotEmpty() && !hwToken.isNullOrEmpty()) {
      callback.invoke(HUAWEI_PUSH_TYPE, hwCertificateName, hwToken)
    } else {
      callback.invoke(null, null, null)
    }
  }

  @ReactMethod
  fun onLogin(_account: String, pushType: Int, _hasTokenPreviously: Boolean, _token: String) {
    if (pushType != HUAWEI_PUSH_TYPE.toInt()) {
      return
    }

    runCatching { getHuaweiPushToken() }
      .onSuccess { token ->
        if (!token.isNullOrEmpty()) {
          emit(EVENT_REGISTER, token)
        }
      }
      .onFailure { error ->
        emit(EVENT_REGISTRATION_ERROR, error.message ?: "Failed to get Huawei push token")
      }
  }

  @ReactMethod
  fun getDeviceInfo(callback: Callback) {
    val info =
      JSONObject().apply {
        put("manufacturer", Build.MANUFACTURER ?: "")
        put("brand", Build.BRAND ?: "")
        put("model", Build.MODEL ?: "")
        put("deviceId", resolveDeviceId())
        put("sdkInt", Build.VERSION.SDK_INT)
        put("release", Build.VERSION.RELEASE ?: "")
      }

    callback.invoke(info.toString())
  }

  @ReactMethod
  fun getHuaweiPushTokenAsync(promise: Promise) {
    runCatching { getHuaweiPushToken() }
      .onSuccess { token ->
        promise.resolve(token)
      }
      .onFailure { error ->
        promise.reject(
          "E_HUAWEI_PUSH_TOKEN",
          error.message ?: "Failed to get Huawei push token",
          error
        )
      }
  }

  @ReactMethod
  fun addListener(_eventName: String) {
    // Required for React Native NativeEventEmitter compatibility.
  }

  @ReactMethod
  fun removeListeners(_count: Double) {
    // Required for React Native NativeEventEmitter compatibility.
  }

  private fun getHuaweiPushToken(): String? {
    val appId = initializedConfig?.optString("hwAppId").orEmpty()
    if (appId.isEmpty()) {
      return null
    }

    return HmsInstanceId.getInstance(reactApplicationContext).getToken(appId, "HCM")
  }

  private fun resolveDeviceId(): String {
    val androidId =
      Settings.Secure.getString(reactApplicationContext.contentResolver, Settings.Secure.ANDROID_ID)
        ?.trim()

    if (!androidId.isNullOrEmpty()) {
      return androidId
    }

    return UUID.nameUUIDFromBytes(
      "${Build.BRAND}-${Build.MODEL}-${Locale.getDefault()}".toByteArray()
    ).toString()
  }

  private fun emit(eventName: String, payload: String) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, payload)
  }
}
