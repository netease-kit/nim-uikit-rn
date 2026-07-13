package com.netease.yunxin.app.im.camera

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import java.util.concurrent.atomic.AtomicInteger

private const val STOP_DELAY_MS = 5_000L

object NativeCameraKeepAliveController {
  private val activeCount = AtomicInteger(0)
  private val mainHandler = Handler(Looper.getMainLooper())
  private var stopRunnable: Runnable? = null

  fun begin(context: Context, source: String) {
    mainHandler.post {
      stopRunnable?.let(mainHandler::removeCallbacks)
      stopRunnable = null

      val count = activeCount.incrementAndGet()

      if (count == 1) {
        startService(context.applicationContext)
      }
    }
  }

  fun end(context: Context, source: String) {
    mainHandler.post {
      val count = (activeCount.decrementAndGet()).coerceAtLeast(0)
      if (count == 0) {
        activeCount.set(0)
      }

      if (count > 0) {
        return@post
      }

      val appContext = context.applicationContext
      val runnable = Runnable {
        if (activeCount.get() > 0) {
          return@Runnable
        }

        appContext.stopService(Intent(appContext, NativeCameraKeepAliveService::class.java))
      }
      stopRunnable = runnable
      mainHandler.postDelayed(runnable, STOP_DELAY_MS)
    }
  }

  private fun startService(context: Context) {
    val intent = Intent(context, NativeCameraKeepAliveService::class.java)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(intent)
    } else {
      context.startService(intent)
    }
  }
}
