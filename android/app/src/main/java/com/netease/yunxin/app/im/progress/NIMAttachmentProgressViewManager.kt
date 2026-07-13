package com.netease.yunxin.app.im.progress

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

private const val VIEW_NAME = "NIMAttachmentProgressView"

class NIMAttachmentProgressViewManager : SimpleViewManager<NIMAttachmentProgressView>() {
  override fun getName(): String = VIEW_NAME

  override fun createViewInstance(reactContext: ThemedReactContext): NIMAttachmentProgressView {
    return NIMAttachmentProgressView(reactContext)
  }

  @ReactProp(name = "variant")
  fun setVariant(view: NIMAttachmentProgressView, variant: String?) {
    view.setVariant(variant)
  }

  @ReactProp(name = "progress", defaultFloat = 0f)
  fun setProgress(view: NIMAttachmentProgressView, progress: Float) {
    view.setProgressValue(progress)
  }
}
