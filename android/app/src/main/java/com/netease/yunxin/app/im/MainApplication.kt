package com.netease.yunxin.app.im

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.netease.yunxin.app.im.camera.NativeCameraKeepAlivePackage
import com.netease.yunxin.app.im.location.NIMLocationPickerPackage
import com.netease.yunxin.app.im.media.NIMMediaLibrarySaverPackage
import com.netease.yunxin.app.im.permission.CameraPermissionCompatPackage
import com.netease.yunxin.app.im.progress.NIMAttachmentProgressPackage
import com.netease.yunxin.app.im.push.NIMOfflinePushPackage

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(CameraPermissionCompatPackage())
          add(NativeCameraKeepAlivePackage())
          add(NIMLocationPickerPackage())
          add(NIMMediaLibrarySaverPackage())
          add(NIMAttachmentProgressPackage())
          add(NIMOfflinePushPackage())
        }
    )
  }

  override fun onCreate() {
    super.onCreate()
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
