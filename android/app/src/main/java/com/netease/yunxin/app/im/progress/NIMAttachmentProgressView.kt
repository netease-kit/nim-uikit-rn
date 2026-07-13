package com.netease.yunxin.app.im.progress

import android.content.Context
import android.graphics.Color
import android.view.Choreographer
import android.widget.FrameLayout
import androidx.appcompat.widget.AppCompatImageView
import com.google.android.material.progressindicator.CircularProgressIndicator
import com.netease.yunxin.app.im.R
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

private const val PROGRESS_MAX = 100
private const val TRACK_COLOR = 0x4D000000
private const val INDICATOR_COLOR = Color.WHITE
private const val MAX_ESTIMATED_PROGRESS = 0.94f
private const val COMPLETION_PROGRESS = 0.99f

class NIMAttachmentProgressView(context: Context) : FrameLayout(context) {
  private val progressBar = CircularProgressIndicator(context)
  private val insideIcon = AppCompatImageView(context)
  private var variant: String = "file"
  private var actualProgress: Float = 0f
  private var visualProgress: Float = 0f
  private var frameCallback: Choreographer.FrameCallback? = null
  private var lastFrameTimeNanos: Long = 0L

  init {
    setWillNotDraw(false)
    progressBar.max = PROGRESS_MAX
    progressBar.setIndicatorColor(INDICATOR_COLOR)
    progressBar.trackColor = TRACK_COLOR
    insideIcon.setImageResource(R.drawable.ic_video_pause_thumb)
    addView(progressBar)
    addView(insideIcon)
    applyVariant()
  }

  fun setVariant(nextVariant: String?) {
    val normalizedVariant = if (nextVariant == "media") "media" else "file"

    if (variant == normalizedVariant) {
      return
    }

    variant = normalizedVariant
    applyVariant()
  }

  fun setProgressValue(nextProgress: Float) {
    val normalizedProgress = nextProgress.coerceIn(0f, COMPLETION_PROGRESS)

    if (
      normalizedProgress + 0.005f < actualProgress ||
        normalizedProgress <= 0.03f && visualProgress > 0.2f
    ) {
      resetProgress(normalizedProgress)
      return
    }

    actualProgress = max(actualProgress, normalizedProgress)
    progressBar.isIndeterminate = false

    if (visualProgress == 0f && normalizedProgress > 0f) {
      visualProgress = min(normalizedProgress, 0.03f)
      setVisualProgress(visualProgress)
    }

    ensureFrameCallback()
  }

  override fun onDetachedFromWindow() {
    stopFrameCallback()
    super.onDetachedFromWindow()
  }

  private fun applyVariant() {
    val density = resources.displayMetrics.density
    val indicatorSizeDp = if (variant == "media") 42 else 20
    val trackThicknessDp = if (variant == "media") 4 else 2
    val iconWidthDp = if (variant == "media") 13 else 6
    val iconHeightDp = if (variant == "media") 18 else 9
    val indicatorSize = (indicatorSizeDp * density).roundToInt()
    val iconWidth = (iconWidthDp * density).roundToInt()
    val iconHeight = (iconHeightDp * density).roundToInt()

    progressBar.indicatorSize = indicatorSize
    progressBar.trackThickness = (trackThicknessDp * density).roundToInt()
    setVisualProgress(visualProgress)
    progressBar.layoutParams =
      LayoutParams(indicatorSize, indicatorSize).apply {
        gravity = android.view.Gravity.CENTER
      }
    insideIcon.layoutParams =
      LayoutParams(iconWidth, iconHeight).apply {
        gravity = android.view.Gravity.CENTER
      }
  }

  private fun resetProgress(progress: Float) {
    actualProgress = progress
    visualProgress = progress
    lastFrameTimeNanos = 0L
    stopFrameCallback()
    setVisualProgress(progress)
  }

  private fun ensureFrameCallback() {
    if (frameCallback != null) {
      return
    }

    lastFrameTimeNanos = 0L
    val callback =
      object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
          stepProgress(frameTimeNanos)
        }
      }
    frameCallback = callback
    Choreographer.getInstance().postFrameCallback(callback)
  }

  private fun stopFrameCallback() {
    frameCallback?.let { Choreographer.getInstance().removeFrameCallback(it) }
    frameCallback = null
  }

  private fun stepProgress(frameTimeNanos: Long) {
    if (lastFrameTimeNanos == 0L) {
      lastFrameTimeNanos = frameTimeNanos
      frameCallback?.let { Choreographer.getInstance().postFrameCallback(it) }
      return
    }

    val elapsedSeconds = ((frameTimeNanos - lastFrameTimeNanos) / 1_000_000_000f).coerceIn(0f, 0.05f)
    lastFrameTimeNanos = frameTimeNanos
    val previousProgress = visualProgress

    if (visualProgress < actualProgress) {
      val diff = actualProgress - visualProgress
      val speed = min(max(diff * 4f, 0.35f), 1.4f)
      visualProgress = min(actualProgress, visualProgress + elapsedSeconds * speed)
    } else if (actualProgress < MAX_ESTIMATED_PROGRESS && visualProgress < MAX_ESTIMATED_PROGRESS) {
      val remaining = MAX_ESTIMATED_PROGRESS - visualProgress
      val speed = min(max(remaining * 0.32f, 0.025f), 0.18f)
      visualProgress = min(MAX_ESTIMATED_PROGRESS, visualProgress + elapsedSeconds * speed)
    }

    if (visualProgress != previousProgress) {
      setVisualProgress(visualProgress)
    }

    val isWaitingForRealProgress =
      actualProgress < MAX_ESTIMATED_PROGRESS && visualProgress >= MAX_ESTIMATED_PROGRESS
    val isComplete = actualProgress >= COMPLETION_PROGRESS && visualProgress >= COMPLETION_PROGRESS
    val isIdle = visualProgress >= actualProgress && actualProgress >= MAX_ESTIMATED_PROGRESS

    if (isWaitingForRealProgress || isComplete || isIdle) {
      stopFrameCallback()
      lastFrameTimeNanos = 0L
      return
    }

    frameCallback?.let { Choreographer.getInstance().postFrameCallback(it) }
  }

  private fun setVisualProgress(progress: Float) {
    progressBar.progress = (progress * PROGRESS_MAX).roundToInt().coerceIn(0, PROGRESS_MAX - 1)
  }
}
