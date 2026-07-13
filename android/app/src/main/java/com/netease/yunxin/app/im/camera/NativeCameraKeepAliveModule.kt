package com.netease.yunxin.app.im.camera

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

private const val MODULE_NAME = "NativeCameraKeepAlive"

@ReactModule(name = MODULE_NAME)
class NativeCameraKeepAliveModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun begin(source: String, promise: Promise) {
    NativeCameraKeepAliveController.begin(reactContext, source)
    promise.resolve(null)
  }

  @ReactMethod
  fun end(source: String, promise: Promise) {
    NativeCameraKeepAliveController.end(reactContext, source)
    promise.resolve(null)
  }
}
