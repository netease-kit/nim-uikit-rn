package com.netease.yunxin.app.im

import android.app.Activity
import android.content.Intent
import android.net.Uri
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.netease.yunxin.app.im.camera.NativeCameraKeepAliveController

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  private var nativeCameraCaptureRequestCode: Int? = null
  private var pauseKeepAliveActive = false

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    setIntent(rewriteIntentWithPushRoute(intent))
    super.onCreate(null)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(rewriteIntentWithPushRoute(intent))
  }

  override fun onPause() {
    if (!isFinishing && !pauseKeepAliveActive) {
      pauseKeepAliveActive = true
      NativeCameraKeepAliveController.begin(this, "MainActivity.onPause")
    }

    super.onPause()
  }

  override fun onResume() {
    super.onResume()

    if (pauseKeepAliveActive) {
      pauseKeepAliveActive = false
      NativeCameraKeepAliveController.end(this, "MainActivity.onResume")
    }
  }

  override fun startActivityForResult(intent: Intent, requestCode: Int) {
    beginNativeCameraCaptureIfNeeded(intent, requestCode, "MainActivity.startActivityForResult")
    super.startActivityForResult(intent, requestCode)
  }

  override fun startActivityForResult(intent: Intent, requestCode: Int, options: Bundle?) {
    beginNativeCameraCaptureIfNeeded(intent, requestCode, "MainActivity.startActivityForResultWithOptions")
    super.startActivityForResult(intent, requestCode, options)
  }

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)

    if (nativeCameraCaptureRequestCode == requestCode) {
      nativeCameraCaptureRequestCode = null
      NativeCameraKeepAliveController.end(this, "MainActivity.onActivityResult")
    }
  }

  override fun onDestroy() {
    if (nativeCameraCaptureRequestCode != null && isFinishing) {
      nativeCameraCaptureRequestCode = null
      NativeCameraKeepAliveController.end(this, "MainActivity.onDestroy")
    }

    super.onDestroy()
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }

  private fun rewriteIntentWithPushRoute(sourceIntent: Intent?): Intent? {
    if (sourceIntent == null) {
      return null
    }

    val deepLinkUrl = resolvePushDeepLink(sourceIntent)
    if (deepLinkUrl.isNullOrBlank()) {
      return sourceIntent
    }

    val deepLinkIntent =
      Intent(sourceIntent).apply {
        action = Intent.ACTION_VIEW
        data = Uri.parse(deepLinkUrl)
      }

    return deepLinkIntent
  }

  private fun resolvePushDeepLink(sourceIntent: Intent): String? {
    val directConversationId = sourceIntent.getStringExtra("conversationId")
    val sessionId = sourceIntent.getStringExtra("sessionId")
    val sessionType = sourceIntent.getStringExtra("sessionType")

    if (directConversationId.isNullOrBlank() && sessionId.isNullOrBlank() && sessionType.isNullOrBlank()) {
      return null
    }

    return Uri.Builder()
      .scheme("neteaseyunxinimdemo")
      .authority("home")
      .apply {
        if (!directConversationId.isNullOrBlank()) {
          appendQueryParameter("conversationId", directConversationId)
        }
        if (!sessionId.isNullOrBlank()) {
          appendQueryParameter("sessionId", sessionId)
        }
        if (!sessionType.isNullOrBlank()) {
          appendQueryParameter("sessionType", sessionType)
        }
      }
      .build()
      .toString()
  }

  private fun beginNativeCameraCaptureIfNeeded(intent: Intent, requestCode: Int, source: String) {
    if (!isNativeCameraCaptureIntent(intent)) {
      return
    }

    nativeCameraCaptureRequestCode = requestCode
    NativeCameraKeepAliveController.begin(this, source)
  }

  private fun isNativeCameraCaptureIntent(intent: Intent): Boolean {
    return intent.action == android.provider.MediaStore.ACTION_IMAGE_CAPTURE ||
      intent.action == android.provider.MediaStore.ACTION_VIDEO_CAPTURE
  }
}
