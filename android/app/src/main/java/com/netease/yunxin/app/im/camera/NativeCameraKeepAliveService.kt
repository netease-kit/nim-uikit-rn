package com.netease.yunxin.app.im.camera

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.netease.yunxin.app.im.R

private const val CHANNEL_ID = "im_camera_capture_keep_alive"
private const val NOTIFICATION_ID = 7341

class NativeCameraKeepAliveService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val notification = buildNotification()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
        NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
      )
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
    return START_NOT_STICKY
  }

  private fun buildNotification(): Notification {
    ensureNotificationChannel()

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.notification_icon)
      .setContentTitle(getString(R.string.native_camera_keep_alive_title))
      .setContentText(getString(R.string.native_camera_keep_alive_text))
      .setPriority(NotificationCompat.PRIORITY_MIN)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
      .setOngoing(true)
      .setSilent(true)
      .build()
  }

  private fun ensureNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (manager.getNotificationChannel(CHANNEL_ID) != null) {
      return
    }

    val channel =
      NotificationChannel(
        CHANNEL_ID,
        getString(R.string.native_camera_keep_alive_channel),
        NotificationManager.IMPORTANCE_MIN
      ).apply {
        setShowBadge(false)
      }
    manager.createNotificationChannel(channel)
  }
}
