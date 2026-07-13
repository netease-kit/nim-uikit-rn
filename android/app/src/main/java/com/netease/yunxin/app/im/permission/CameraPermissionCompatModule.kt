package com.netease.yunxin.app.im.permission

import android.Manifest
import android.os.Process
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

private const val MODULE_NAME = "CameraPermissionCompat"
private const val TAG = "CameraPermissionCompat"
private const val FLAG_PERMISSION_ONE_TIME = 1 shl 16

@ReactModule(name = MODULE_NAME)
class CameraPermissionCompatModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun scheduleRevokeCameraPermissionOnKill(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        if (hasOneTimeCameraPermission()) {
          Log.i(TAG, "Scheduling CAMERA revoke on kill for ${reactContext.packageName}")
          reactContext.revokeSelfPermissionOnKill(Manifest.permission.CAMERA)
        } else {
          Log.i(TAG, "Skipping CAMERA revoke on kill because permission is not one-time")
        }
      } else {
        Log.i(TAG, "Skipping revoke-on-kill because SDK=${Build.VERSION.SDK_INT}")
      }

      promise.resolve(null)
    } catch (error: Exception) {
      Log.w(TAG, "Failed to schedule camera permission revoke on kill", error)
      promise.resolve(null)
    }
  }

  private fun hasOneTimeCameraPermission(): Boolean {
    return try {
      val getPermissionFlags =
        reactContext.packageManager.javaClass.getMethod(
          "getPermissionFlags",
          String::class.java,
          String::class.java,
          android.os.UserHandle::class.java
        )
      val flags =
        getPermissionFlags.invoke(
          reactContext.packageManager,
          Manifest.permission.CAMERA,
          reactContext.packageName,
          Process.myUserHandle()
        ) as? Int ?: 0
      val isOneTime = flags and FLAG_PERMISSION_ONE_TIME != 0

      Log.i(TAG, "Camera permission flags=$flags oneTime=$isOneTime")
      isOneTime
    } catch (error: Exception) {
      Log.w(TAG, "Failed to read camera permission flags", error)
      false
    }
  }
}
