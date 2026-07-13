package com.netease.yunxin.app.im.location

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

private const val MODULE_NAME = "NIMLocationPicker"
private const val REQUEST_PICK_LOCATION = 7216
private const val TAG = "NIMLocationPicker"

@ReactModule(name = MODULE_NAME)
class NIMLocationPickerModule(
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
        if (requestCode != REQUEST_PICK_LOCATION) {
          return
        }

        val promise = pendingPromise ?: return
        pendingPromise = null

        if (resultCode == Activity.RESULT_CANCELED) {
          promise.reject("E_LOCATION_PICKER_CANCELLED", "LOCATION_PICKER_CANCELLED")
          return
        }

        if (resultCode != Activity.RESULT_OK || data == null) {
          promise.reject("E_LOCATION_PICKER_FAILED", "Location picker did not return a result")
          return
        }

        promise.resolve(
          Arguments.createMap().apply {
            putString("title", data.getStringExtra(NIMLocationPickerActivity.EXTRA_TITLE).orEmpty())
            putString(
              "address",
              data.getStringExtra(NIMLocationPickerActivity.EXTRA_ADDRESS).orEmpty()
            )
            putDouble("latitude", data.getDoubleExtra(NIMLocationPickerActivity.EXTRA_LATITUDE, 0.0))
            putDouble(
              "longitude",
              data.getDoubleExtra(NIMLocationPickerActivity.EXTRA_LONGITUDE, 0.0)
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
  fun pickLocation(promise: Promise) {
    val activity = reactContext.currentActivity
    Log.i(TAG, "pickLocation called, activity=${activity?.javaClass?.name}")

    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No foreground activity")
      return
    }

    if (pendingPromise != null) {
      promise.reject("E_LOCATION_PICKER_BUSY", "Location picker is already open")
      return
    }

    pendingPromise = promise
    activity.startActivityForResult(
      Intent(activity, NIMLocationPickerActivity::class.java),
      REQUEST_PICK_LOCATION
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
