package com.netease.yunxin.app.im.camera

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.Drawable
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.AspectRatio
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.netease.yunxin.app.im.R
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NIMCameraCaptureActivity : AppCompatActivity() {
  private lateinit var previewView: PreviewView
  private lateinit var captureButton: FrameLayout
  private lateinit var captureButtonInner: View
  private lateinit var timerContainer: LinearLayout
  private lateinit var timerDot: View
  private lateinit var timerText: TextView
  private lateinit var flashButton: CameraIconButton
  private lateinit var switchCameraButton: CameraIconButton
  private lateinit var modeHintText: TextView
  private val timerHandler = Handler(Looper.getMainLooper())
  private var imageCapture: ImageCapture? = null
  private var videoCapture: VideoCapture<Recorder>? = null
  private var cameraProvider: ProcessCameraProvider? = null
  private var camera: Camera? = null
  private var activeRecording: Recording? = null
  private var recordingFile: File? = null
  private var captureMode = MODE_IMAGE
  private var lensFacing = CameraSelector.LENS_FACING_BACK
  private var isRecording = false
  private var isStartingRecording = false
  private var isCapturingPhoto = false
  private var isSwitchingCamera = false
  private var recordingStartedAt = 0L
  private var torchEnabled = false
  private val recordingTimerRunnable =
    object : Runnable {
      override fun run() {
        if (!isRecording) {
          return
        }

        val elapsedMs = System.currentTimeMillis() - recordingStartedAt
        timerText.text = formatRecordingDuration(elapsedMs)
        timerHandler.postDelayed(this, 250)
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    captureMode = intent.getStringExtra(EXTRA_MODE) ?: MODE_IMAGE
    Log.i(TAG, "onCreate mode=$captureMode")
    setupContentView()

    if (!hasRequiredPermissions()) {
      setResult(Activity.RESULT_CANCELED)
      finish()
      return
    }

    startCamera()
  }

  override fun onDestroy() {
    stopRecordingTimer()
    activeRecording?.close()
    activeRecording = null
    window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    super.onDestroy()
  }

  private fun setupContentView() {
    val root = FrameLayout(this).apply {
      setBackgroundColor(0xFF000000.toInt())
      keepScreenOn = true
      layoutParams =
        FrameLayout.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
    }

    previewView = PreviewView(this).apply {
      scaleType = PreviewView.ScaleType.FILL_CENTER
      layoutParams =
        FrameLayout.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
    }
    root.addView(previewView)

    timerContainer = buildTimerContainer().apply {
      visibility = if (captureMode == MODE_VIDEO) View.VISIBLE else View.GONE
      layoutParams =
        FrameLayout.LayoutParams(dp(116), dp(38), Gravity.TOP or Gravity.CENTER_HORIZONTAL).apply {
          topMargin = dp(34)
        }
    }
    root.addView(timerContainer)

    val closeButton = buildTopIconButton(CameraIcon.CLOSE).apply {
      contentDescription = getString(R.string.native_camera_capture_cancel)
      setOnClickListener {
        setResult(Activity.RESULT_CANCELED)
        finish()
      }
      layoutParams =
        FrameLayout.LayoutParams(dp(44), dp(44), Gravity.TOP or Gravity.START).apply {
          topMargin = dp(32)
          leftMargin = dp(16)
        }
    }
    root.addView(closeButton)

    flashButton = buildTopIconButton(CameraIcon.FLASH_OFF).apply {
      contentDescription = getString(R.string.native_camera_capture_flash_off)
      setOnClickListener {
        toggleFlash()
      }
      layoutParams =
        FrameLayout.LayoutParams(dp(44), dp(44), Gravity.TOP or Gravity.END).apply {
          topMargin = dp(32)
          rightMargin = dp(16)
        }
    }
    root.addView(flashButton)

    switchCameraButton = buildTopIconButton(CameraIcon.SWITCH_CAMERA).apply {
      contentDescription = getString(R.string.native_camera_capture_switch_camera)
      setOnClickListener {
        switchCamera()
      }
      layoutParams =
        FrameLayout.LayoutParams(dp(50), dp(50), Gravity.BOTTOM or Gravity.END).apply {
          rightMargin = dp(36)
          bottomMargin = dp(72)
        }
    }
    root.addView(switchCameraButton)

    captureButton =
      FrameLayout(this).apply {
        setOnClickListener {
          if (captureMode == MODE_VIDEO) {
            toggleVideoRecording()
          } else {
            takePhoto()
          }
        }
        layoutParams =
          FrameLayout.LayoutParams(dp(82), dp(82), Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL).apply {
            bottomMargin = dp(56)
          }
      }
    captureButtonInner =
      View(this).apply {
        layoutParams = FrameLayout.LayoutParams(dp(54), dp(54), Gravity.CENTER)
      }
    captureButton.addView(captureButtonInner)
    root.addView(captureButton)

    modeHintText =
      TextView(this).apply {
        setTextColor(Color.WHITE)
        textSize = 14f
        gravity = Gravity.CENTER
        setShadowLayer(4f, 0f, 1f, Color.BLACK)
        layoutParams =
          FrameLayout.LayoutParams(dp(180), dp(28), Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL).apply {
            bottomMargin = dp(142)
          }
      }
    root.addView(modeHintText)

    setContentView(root)
    updateCaptureButtonUi()
    updateFlashButtonUi()
  }

  private fun buildTopIconButton(icon: CameraIcon): CameraIconButton {
    return CameraIconButton(this).apply {
      this.icon = icon
      background = buildOvalDrawable(0x66000000, 0, Color.TRANSPARENT)
    }
  }

  private fun buildTimerContainer(): LinearLayout {
    return LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
      background = buildRoundRectDrawable(0x66000000, dp(19))
      timerDot =
        View(context).apply {
          background = buildOvalDrawable(0xFFE53935.toInt(), 0, Color.TRANSPARENT)
          visibility = View.INVISIBLE
          layoutParams =
            LinearLayout.LayoutParams(dp(8), dp(8)).apply {
              rightMargin = dp(8)
            }
        }
      timerText =
        TextView(context).apply {
          text = getString(R.string.native_camera_capture_timer_default)
          setTextColor(Color.WHITE)
          textSize = 16f
          typeface = Typeface.DEFAULT_BOLD
          gravity = Gravity.CENTER
          includeFontPadding = false
        }
      addView(timerDot)
      addView(timerText)
    }
  }

  private fun startCamera() {
    val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
    cameraProviderFuture.addListener(
      {
        try {
          cameraProvider = cameraProviderFuture.get()
          bindCameraUseCases()
        } catch (error: Exception) {
          Log.e(TAG, "startCamera failed", error)
          finishWithError("E_CAMERA_START_FAILED", error.message ?: "Camera start failed")
        }
      },
      ContextCompat.getMainExecutor(this)
    )
  }

  private fun bindCameraUseCases() {
    val provider = cameraProvider ?: return
    val cameraSelector = resolveCameraSelector()
    val preview =
      Preview.Builder()
        .setTargetAspectRatio(AspectRatio.RATIO_16_9)
        .build()
        .also { it.setSurfaceProvider(previewView.surfaceProvider) }

    provider.unbindAll()
    imageCapture = null
    videoCapture = null
    camera = null
    torchEnabled = false

    if (captureMode == MODE_VIDEO) {
      val recorder =
        Recorder.Builder()
          .setQualitySelector(QualitySelector.from(Quality.HD))
          .build()
      videoCapture = VideoCapture.withOutput(recorder)
      camera = provider.bindToLifecycle(this, cameraSelector, preview, videoCapture)
    } else {
      imageCapture =
        ImageCapture.Builder()
          .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
          .setTargetAspectRatio(AspectRatio.RATIO_16_9)
          .build()
      camera = provider.bindToLifecycle(this, cameraSelector, preview, imageCapture)
    }

    isSwitchingCamera = false
    updateFlashButtonUi()
    updateSwitchCameraButtonUi()
  }

  private fun resolveCameraSelector(): CameraSelector {
    val provider = cameraProvider ?: return CameraSelector.DEFAULT_BACK_CAMERA
    val preferredSelector = buildCameraSelector(lensFacing)

    if (provider.hasCamera(preferredSelector)) {
      return preferredSelector
    }

    val fallbackLensFacing =
      if (lensFacing == CameraSelector.LENS_FACING_BACK) {
        CameraSelector.LENS_FACING_FRONT
      } else {
        CameraSelector.LENS_FACING_BACK
      }
    val fallbackSelector = buildCameraSelector(fallbackLensFacing)

    if (provider.hasCamera(fallbackSelector)) {
      lensFacing = fallbackLensFacing
      return fallbackSelector
    }

    return preferredSelector
  }

  private fun buildCameraSelector(lensFacing: Int): CameraSelector {
    return CameraSelector.Builder()
      .requireLensFacing(lensFacing)
      .build()
  }

  private fun takePhoto() {
    if (isCapturingPhoto) {
      return
    }

    val capture = imageCapture ?: return
    isCapturingPhoto = true
    captureButton.isEnabled = false
    updateSwitchCameraButtonUi()
    modeHintText.text = getString(R.string.native_camera_capture_saving)
    updateCaptureButtonUi()

    val outputFile = createOutputFile("IMG", ".jpg")
    val outputOptions = ImageCapture.OutputFileOptions.Builder(outputFile).build()

    capture.takePicture(
      outputOptions,
      ContextCompat.getMainExecutor(this),
      object : ImageCapture.OnImageSavedCallback {
        override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
          finishWithMedia(outputFile, "image/jpeg", 0L)
        }

        override fun onError(exception: ImageCaptureException) {
          Log.e(TAG, "takePhoto failed", exception)
          isCapturingPhoto = false
          captureButton.isEnabled = true
          updateSwitchCameraButtonUi()
          updateCaptureButtonUi()
          finishWithError("E_TAKE_PHOTO_FAILED", exception.message ?: "Take photo failed")
        }
      }
    )
  }

  private fun toggleVideoRecording() {
    if (isStartingRecording) {
      return
    }

    if (isRecording) {
      stopVideoRecording()
      return
    }

    val capture = videoCapture ?: return
    val outputFile = createOutputFile("VID", ".mp4")
    recordingFile = outputFile
    val outputOptions = FileOutputOptions.Builder(outputFile).build()
    isStartingRecording = true
    captureButton.isEnabled = false
    updateSwitchCameraButtonUi()
    modeHintText.text = getString(R.string.native_camera_capture_record_starting)
    updateCaptureButtonUi()

    val pendingRecording = capture.output.prepareRecording(this, outputOptions)
    activeRecording =
      if (ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) ==
        PackageManager.PERMISSION_GRANTED
      ) {
        pendingRecording.withAudioEnabled()
      } else {
        pendingRecording
      }.start(ContextCompat.getMainExecutor(this)) { event ->
        when (event) {
          is VideoRecordEvent.Start -> {
            Log.i(TAG, "recordVideo started")
            isStartingRecording = false
            isRecording = true
            recordingStartedAt = System.currentTimeMillis()
            captureButton.isEnabled = true
            updateSwitchCameraButtonUi()
            updateCaptureButtonUi()
            startRecordingTimer()
          }
          is VideoRecordEvent.Finalize -> {
            val file = recordingFile
            val elapsedMs =
              if (recordingStartedAt > 0L) System.currentTimeMillis() - recordingStartedAt else 0L
            Log.i(
              TAG,
              "recordVideo finalized hasError=${event.hasError()} elapsedMs=$elapsedMs fileSize=${file?.length() ?: -1L}"
            )
            activeRecording = null
            recordingFile = null
            isStartingRecording = false
            isRecording = false
            stopRecordingTimer()
            if (event.hasError() || file == null || !file.exists()) {
              val cause = event.cause
              Log.e(TAG, "recordVideo failed", cause)
              captureButton.isEnabled = true
              updateSwitchCameraButtonUi()
              updateCaptureButtonUi()
              finishWithError(
                "E_RECORD_VIDEO_FAILED",
                cause?.message ?: "Record video failed"
              )
              return@start
            }

            finishWithMedia(file, "video/mp4", readVideoDurationMs(file))
          }
        }
      }
  }

  private fun stopVideoRecording() {
    if (!isRecording) {
      return
    }

    captureButton.isEnabled = false
    updateSwitchCameraButtonUi()
    modeHintText.text = getString(R.string.native_camera_capture_saving)
    val elapsedMs =
      if (recordingStartedAt > 0L) System.currentTimeMillis() - recordingStartedAt else 0L
    Log.i(TAG, "stopVideoRecording requested elapsedMs=$elapsedMs")
    activeRecording?.stop()
  }

  private fun startRecordingTimer() {
    timerHandler.removeCallbacks(recordingTimerRunnable)
    timerText.text = getString(R.string.native_camera_capture_timer_default)
    timerHandler.post(recordingTimerRunnable)
  }

  private fun stopRecordingTimer() {
    timerHandler.removeCallbacks(recordingTimerRunnable)
  }

  private fun toggleFlash() {
    val currentCamera = camera ?: return

    if (!currentCamera.cameraInfo.hasFlashUnit()) {
      return
    }

    torchEnabled = !torchEnabled
    applyTorchState()
    updateFlashButtonUi()
  }

  private fun switchCamera() {
    val provider = cameraProvider ?: return
    if (
      isRecording ||
      isStartingRecording ||
      isCapturingPhoto ||
      isSwitchingCamera ||
      !hasSwitchableCamera(provider)
    ) {
      return
    }

    isSwitchingCamera = true
    updateSwitchCameraButtonUi()
    lensFacing =
      if (lensFacing == CameraSelector.LENS_FACING_BACK) {
        CameraSelector.LENS_FACING_FRONT
      } else {
        CameraSelector.LENS_FACING_BACK
      }

    try {
      bindCameraUseCases()
    } catch (error: Exception) {
      Log.e(TAG, "switchCamera failed", error)
      lensFacing =
        if (lensFacing == CameraSelector.LENS_FACING_BACK) {
          CameraSelector.LENS_FACING_FRONT
        } else {
          CameraSelector.LENS_FACING_BACK
        }
      isSwitchingCamera = false
      updateSwitchCameraButtonUi()
    }
  }

  private fun hasSwitchableCamera(provider: ProcessCameraProvider): Boolean {
    return provider.hasCamera(buildCameraSelector(CameraSelector.LENS_FACING_BACK)) &&
      provider.hasCamera(buildCameraSelector(CameraSelector.LENS_FACING_FRONT))
  }

  private fun applyTorchState() {
    val currentCamera = camera ?: return

    if (!currentCamera.cameraInfo.hasFlashUnit()) {
      torchEnabled = false
      return
    }

    imageCapture?.flashMode =
      if (torchEnabled) ImageCapture.FLASH_MODE_ON else ImageCapture.FLASH_MODE_OFF
    currentCamera.cameraControl.enableTorch(torchEnabled)
  }

  private fun updateFlashButtonUi() {
    if (!::flashButton.isInitialized) {
      return
    }

    val hasFlash = camera?.cameraInfo?.hasFlashUnit() ?: false
    flashButton.isEnabled = hasFlash
    flashButton.alpha = if (hasFlash) 1f else 0.45f
    flashButton.icon = if (torchEnabled) CameraIcon.FLASH_ON else CameraIcon.FLASH_OFF
    flashButton.contentDescription =
      when {
        !hasFlash -> getString(R.string.native_camera_capture_flash_unavailable)
        torchEnabled -> getString(R.string.native_camera_capture_flash_on)
        else -> getString(R.string.native_camera_capture_flash_off)
      }
  }

  private fun updateSwitchCameraButtonUi() {
    if (!::switchCameraButton.isInitialized) {
      return
    }

    val canSwitch =
      cameraProvider?.let { hasSwitchableCamera(it) } == true &&
        !isRecording &&
        !isStartingRecording &&
        !isCapturingPhoto &&
        !isSwitchingCamera
    switchCameraButton.isEnabled = canSwitch
    switchCameraButton.alpha = if (canSwitch) 1f else 0.45f
  }

  private fun updateCaptureButtonUi() {
    if (!::captureButton.isInitialized || !::captureButtonInner.isInitialized) {
      return
    }

    if (captureMode == MODE_VIDEO) {
      timerContainer.visibility = View.VISIBLE
      timerDot.visibility = if (isRecording) View.VISIBLE else View.INVISIBLE
      if (isRecording || isStartingRecording) {
        if (isRecording) {
          modeHintText.text = getString(R.string.native_camera_capture_record_stop_tip)
        }
        captureButton.background = buildOvalDrawable(Color.TRANSPARENT, dp(4), Color.WHITE)
        updateInnerButton(dp(34), buildRoundRectDrawable(0xFFE53935.toInt(), dp(8)))
      } else {
        modeHintText.text = getString(R.string.native_camera_capture_record_start_tip)
        captureButton.background = buildOvalDrawable(Color.TRANSPARENT, dp(4), Color.WHITE)
        updateInnerButton(dp(56), buildOvalDrawable(0xFFE53935.toInt(), 0, Color.TRANSPARENT))
      }
      return
    }

    timerContainer.visibility = View.GONE
    if (!isCapturingPhoto) {
      modeHintText.text = getString(R.string.native_camera_capture_take_photo_tip)
    }
    captureButton.background = buildOvalDrawable(Color.WHITE, 0, Color.TRANSPARENT)
    updateInnerButton(dp(66), buildOvalDrawable(Color.TRANSPARENT, dp(3), 0xDD111111.toInt()))
  }

  private fun updateInnerButton(size: Int, drawable: GradientDrawable) {
    captureButtonInner.background = drawable
    captureButtonInner.layoutParams = FrameLayout.LayoutParams(size, size, Gravity.CENTER)
  }

  private fun finishWithMedia(file: File, mimeType: String, durationMs: Long) {
    val size = file.length()
    val dimensions = readMediaDimensions(file, mimeType)
    val data =
      Intent().apply {
        putExtra(EXTRA_URI, Uri.fromFile(file).toString())
        putExtra(EXTRA_FILE_NAME, file.name)
        putExtra(EXTRA_MIME_TYPE, mimeType)
        putExtra(EXTRA_FILE_SIZE, size)
        putExtra(EXTRA_WIDTH, dimensions.first)
        putExtra(EXTRA_HEIGHT, dimensions.second)
        putExtra(EXTRA_DURATION, durationMs)
      }
    setResult(Activity.RESULT_OK, data)
    finish()
  }

  private fun finishWithError(code: String, message: String) {
    setResult(
      RESULT_ERROR,
      Intent().apply {
        putExtra(EXTRA_ERROR_CODE, code)
        putExtra(EXTRA_ERROR_MESSAGE, message)
      }
    )
    finish()
  }

  private fun createOutputFile(prefix: String, suffix: String): File {
    val dir = File(cacheDir, "camera-capture").apply { mkdirs() }
    val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss_SSS", Locale.US).format(Date())
    return File(dir, "${prefix}_${timestamp}${suffix}")
  }

  private fun readMediaDimensions(file: File, mimeType: String): Pair<Int, Int> {
    if (mimeType.startsWith("image/")) {
      val options = android.graphics.BitmapFactory.Options().apply { inJustDecodeBounds = true }
      android.graphics.BitmapFactory.decodeFile(file.absolutePath, options)
      return Pair(options.outWidth.coerceAtLeast(0), options.outHeight.coerceAtLeast(0))
    }

    val retriever = MediaMetadataRetriever()
    return try {
      retriever.setDataSource(file.absolutePath)
      val width =
        retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull()
          ?: 0
      val height =
        retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull()
          ?: 0
      Pair(width, height)
    } catch (error: Exception) {
      Pair(0, 0)
    } finally {
      retriever.release()
    }
  }

  private fun readVideoDurationMs(file: File): Long {
    val retriever = MediaMetadataRetriever()
    return try {
      retriever.setDataSource(file.absolutePath)
      retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L
    } catch (error: Exception) {
      0L
    } finally {
      retriever.release()
    }
  }

  private fun hasRequiredPermissions(): Boolean {
    if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) !=
      PackageManager.PERMISSION_GRANTED
    ) {
      return false
    }

    if (captureMode == MODE_VIDEO &&
      ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) !=
      PackageManager.PERMISSION_GRANTED
    ) {
      return false
    }

    return true
  }

  private fun dp(value: Int): Int {
    return (value * resources.displayMetrics.density).toInt()
  }

  private fun buildOvalDrawable(fillColor: Int, strokeWidth: Int, strokeColor: Int): GradientDrawable {
    return GradientDrawable().apply {
      shape = GradientDrawable.OVAL
      setColor(fillColor)
      if (strokeWidth > 0) {
        setStroke(strokeWidth, strokeColor)
      }
    }
  }

  private fun buildRoundRectDrawable(fillColor: Int, radius: Int): GradientDrawable {
    return GradientDrawable().apply {
      shape = GradientDrawable.RECTANGLE
      cornerRadius = radius.toFloat()
      setColor(fillColor)
    }
  }

  private fun formatRecordingDuration(durationMs: Long): String {
    val totalSeconds = (durationMs / 1000).coerceAtLeast(0)
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%02d:%02d".format(Locale.US, minutes, seconds)
  }

  companion object {
    const val EXTRA_MODE = "mode"
    const val EXTRA_URI = "uri"
    const val EXTRA_FILE_NAME = "fileName"
    const val EXTRA_MIME_TYPE = "mimeType"
    const val EXTRA_FILE_SIZE = "fileSize"
    const val EXTRA_WIDTH = "width"
    const val EXTRA_HEIGHT = "height"
    const val EXTRA_DURATION = "duration"
    const val EXTRA_ERROR_CODE = "errorCode"
    const val EXTRA_ERROR_MESSAGE = "errorMessage"
    const val MODE_IMAGE = "image"
    const val MODE_VIDEO = "video"
    const val RESULT_ERROR = Activity.RESULT_FIRST_USER + 41
    private const val TAG = "NIMCameraCapture"
  }
}

private enum class CameraIcon {
  CLOSE,
  FLASH_OFF,
  FLASH_ON,
  SWITCH_CAMERA
}

private class CameraIconButton(context: Context) : View(context) {
  var icon: CameraIcon = CameraIcon.CLOSE
    set(value) {
      field = value
      invalidate()
    }

  private val switchCameraDrawable: Drawable? =
    ContextCompat.getDrawable(context, R.drawable.native_camera_switch)

  private val paint =
    Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      strokeCap = Paint.Cap.ROUND
      strokeJoin = Paint.Join.ROUND
    }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    val w = width.toFloat()
    val h = height.toFloat()
    when (icon) {
      CameraIcon.CLOSE -> drawClose(canvas, w, h)
      CameraIcon.FLASH_OFF -> drawFlash(canvas, w, h, true)
      CameraIcon.FLASH_ON -> drawFlash(canvas, w, h, false)
      CameraIcon.SWITCH_CAMERA -> drawSwitchCamera(canvas)
    }
  }

  private fun drawClose(canvas: Canvas, width: Float, height: Float) {
    paint.style = Paint.Style.STROKE
    paint.strokeWidth = width * 0.055f
    val start = width * 0.34f
    val end = width * 0.66f
    canvas.drawLine(start, height * 0.34f, end, height * 0.66f, paint)
    canvas.drawLine(end, height * 0.34f, start, height * 0.66f, paint)
  }

  private fun drawFlash(canvas: Canvas, width: Float, height: Float, disabled: Boolean) {
    paint.style = Paint.Style.FILL
    val path =
      Path().apply {
        moveTo(width * 0.55f, height * 0.18f)
        lineTo(width * 0.34f, height * 0.54f)
        lineTo(width * 0.50f, height * 0.54f)
        lineTo(width * 0.42f, height * 0.82f)
        lineTo(width * 0.68f, height * 0.45f)
        lineTo(width * 0.52f, height * 0.45f)
        close()
      }
    canvas.drawPath(path, paint)

    if (disabled) {
      paint.style = Paint.Style.STROKE
      paint.strokeWidth = width * 0.055f
      canvas.drawLine(width * 0.70f, height * 0.26f, width * 0.28f, height * 0.74f, paint)
    }
  }

  private fun drawSwitchCamera(canvas: Canvas) {
    val drawable = switchCameraDrawable ?: return
    val drawableWidth = drawable.intrinsicWidth.coerceAtLeast(1)
    val drawableHeight = drawable.intrinsicHeight.coerceAtLeast(1)
    val maxWidth = width * 0.72f
    val maxHeight = height * 0.72f
    val scale = minOf(maxWidth / drawableWidth, maxHeight / drawableHeight)
    val drawWidth = (drawableWidth * scale).toInt()
    val drawHeight = (drawableHeight * scale).toInt()
    val left = (width - drawWidth) / 2
    val top = (height - drawHeight) / 2

    drawable.setBounds(left, top, left + drawWidth, top + drawHeight)
    drawable.draw(canvas)
  }
}
