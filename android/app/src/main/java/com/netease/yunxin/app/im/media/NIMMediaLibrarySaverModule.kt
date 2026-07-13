package com.netease.yunxin.app.im.media

import android.Manifest
import android.content.ContentValues
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.io.FileInputStream

private const val MODULE_NAME = "NIMMediaLibrarySaver"

@ReactModule(name = MODULE_NAME)
class NIMMediaLibrarySaverModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun saveToLibrary(localUri: String, mediaType: String, promise: Promise) {
    Thread {
      try {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q && !hasLegacyWritePermission()) {
          promise.reject("E_MEDIA_LIBRARY_PERMISSION", "Missing external storage write permission")
          return@Thread
        }

        val normalizedMediaType = if (mediaType == "video") "video" else "image"
        val sourceUri = Uri.parse(localUri)
        val displayName = resolveDisplayName(sourceUri, normalizedMediaType)
        val mimeType = resolveMimeType(sourceUri, displayName, normalizedMediaType)
        val collectionUri =
          if (normalizedMediaType == "video") {
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI
          } else {
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI
          }
        val values =
          ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, displayName)
            put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
            put(MediaStore.MediaColumns.DATE_TAKEN, System.currentTimeMillis())
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
              put(
                MediaStore.MediaColumns.RELATIVE_PATH,
                if (normalizedMediaType == "video") {
                  Environment.DIRECTORY_MOVIES
                } else {
                  Environment.DIRECTORY_PICTURES
                }
              )
              put(MediaStore.MediaColumns.IS_PENDING, 1)
            }
          }
        val resolver = reactContext.contentResolver
        val destinationUri =
          resolver.insert(collectionUri, values)
            ?: throw IllegalStateException("Failed to create MediaStore entry")

        try {
          resolver.openOutputStream(destinationUri, "w")?.use { output ->
            openInputStream(sourceUri, localUri)?.use { input ->
              input.copyTo(output)
            } ?: throw IllegalArgumentException("Cannot open source media file")
          } ?: throw IllegalStateException("Cannot open MediaStore output stream")

          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            resolver.update(
              destinationUri,
              ContentValues().apply { put(MediaStore.MediaColumns.IS_PENDING, 0) },
              null,
              null
            )
          }

          promise.resolve(
            Arguments.createMap().apply {
              putString("uri", destinationUri.toString())
              putString("mediaType", normalizedMediaType)
            }
          )
        } catch (error: Exception) {
          resolver.delete(destinationUri, null, null)
          throw error
        }
      } catch (error: Exception) {
        promise.reject("E_MEDIA_LIBRARY_SAVE_FAILED", error.message ?: "Failed to save media", error)
      }
    }.start()
  }

  private fun hasLegacyWritePermission(): Boolean {
    return Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
      reactContext.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) ==
        PackageManager.PERMISSION_GRANTED
  }

  private fun openInputStream(sourceUri: Uri, localUri: String) =
    when (sourceUri.scheme) {
      "content" -> reactContext.contentResolver.openInputStream(sourceUri)
      "file" -> FileInputStream(File(sourceUri.path ?: ""))
      else -> FileInputStream(File(localUri))
    }

  private fun resolveDisplayName(sourceUri: Uri, mediaType: String): String {
    val pathName = sourceUri.path?.let { File(it).name }?.takeIf { it.isNotBlank() }
    val rawName = pathName ?: sourceUri.lastPathSegment?.takeIf { it.isNotBlank() }
    val fallbackName = "nim_${System.currentTimeMillis()}.${if (mediaType == "video") "mp4" else "jpg"}"
    val name = rawName ?: fallbackName

    return if (name.contains(".")) {
      name
    } else {
      "$name.${if (mediaType == "video") "mp4" else "jpg"}"
    }
  }

  private fun resolveMimeType(sourceUri: Uri, displayName: String, mediaType: String): String {
    val resolverMimeType =
      runCatching { reactContext.contentResolver.getType(sourceUri) }.getOrNull()
    if (!resolverMimeType.isNullOrBlank()) {
      return resolverMimeType
    }

    val extension = displayName.substringAfterLast('.', "").lowercase()
    val extensionMimeType =
      MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
    if (!extensionMimeType.isNullOrBlank()) {
      return extensionMimeType
    }

    return if (mediaType == "video") "video/mp4" else "image/jpeg"
  }
}
