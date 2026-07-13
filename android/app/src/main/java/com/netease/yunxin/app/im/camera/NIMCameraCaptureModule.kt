package com.netease.yunxin.app.im.camera

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

private const val MODULE_NAME = "NIMCameraCapture"
private const val REQUEST_CAPTURE_MEDIA = 7618

@ReactModule(name = MODULE_NAME)
class NIMCameraCaptureModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  private var pendingPromise: Promise? = null

  private val activityEventListener: ActivityEventListener =
    object : BaseActivityEventListener() {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
      ) {
        if (requestCode != REQUEST_CAPTURE_MEDIA) {
          return
        }

        val promise = pendingPromise ?: return
        pendingPromise = null

        if (resultCode == Activity.RESULT_CANCELED) {
          promise.resolve(
            Arguments.createMap().apply {
              putBoolean("canceled", true)
              putArray("assets", Arguments.createArray())
            }
          )
          return
        }

        if (resultCode == NIMCameraCaptureActivity.RESULT_ERROR) {
          promise.reject(
            data?.getStringExtra(NIMCameraCaptureActivity.EXTRA_ERROR_CODE)
              ?: "E_CAMERA_CAPTURE_FAILED",
            data?.getStringExtra(NIMCameraCaptureActivity.EXTRA_ERROR_MESSAGE)
              ?: "Camera capture failed"
          )
          return
        }

        if (resultCode != Activity.RESULT_OK || data == null) {
          promise.reject("E_CAMERA_CAPTURE_FAILED", "Camera capture did not return a result")
          return
        }

        promise.resolve(
          Arguments.createMap().apply {
            putBoolean("canceled", false)
            putArray(
              "assets",
              Arguments.createArray().apply {
                pushMap(
                  Arguments.createMap().apply {
                    putString("uri", data.getStringExtra(NIMCameraCaptureActivity.EXTRA_URI))
                    putString(
                      "fileName",
                      data.getStringExtra(NIMCameraCaptureActivity.EXTRA_FILE_NAME)
                    )
                    putString(
                      "mimeType",
                      data.getStringExtra(NIMCameraCaptureActivity.EXTRA_MIME_TYPE)
                    )
                    putDouble(
                      "fileSize",
                      data.getLongExtra(NIMCameraCaptureActivity.EXTRA_FILE_SIZE, 0L).toDouble()
                    )
                    putInt("width", data.getIntExtra(NIMCameraCaptureActivity.EXTRA_WIDTH, 0))
                    putInt("height", data.getIntExtra(NIMCameraCaptureActivity.EXTRA_HEIGHT, 0))
                    putDouble(
                      "duration",
                      data.getLongExtra(NIMCameraCaptureActivity.EXTRA_DURATION, 0L).toDouble()
                    )
                  }
                )
              }
            )
          }
        )
      }
    }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun capture(mode: String, promise: Promise) {
    val activity = reactContext.currentActivity

    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No foreground activity")
      return
    }

    if (pendingPromise != null) {
      promise.reject("E_CAMERA_CAPTURE_BUSY", "Camera capture is already open")
      return
    }

    pendingPromise = promise
    activity.startActivityForResult(
      Intent(activity, NIMCameraCaptureActivity::class.java).apply {
        putExtra(NIMCameraCaptureActivity.EXTRA_MODE, mode)
      },
      REQUEST_CAPTURE_MEDIA
    )
  }

  @ReactMethod
  fun addListener(_eventName: String) {
    // Required for React Native NativeEventEmitter compatibility.
  }

  @ReactMethod
  fun removeListeners(_count: Double) {
    // Required for React Native NativeEventEmitter compatibility.
  }
}
