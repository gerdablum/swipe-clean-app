package com.swipecleanapp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import android.provider.DocumentsContract
import androidx.documentfile.provider.DocumentFile
import androidx.exifinterface.media.ExifInterface
import com.facebook.react.bridge.Arguments
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.provider.MediaStore

class StorageAccessModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  private var folderPickerPromise: Promise? = null
  private val sharedPreferences =
    reactContext.getSharedPreferences("swipe_clean_paths", android.content.Context.MODE_PRIVATE)

  companion object {
    private const val FOLDER_PICKER_REQUEST_CODE = 8342
  }

  private val folderPickerEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(
      activity: Activity,
      requestCode: Int,
      resultCode: Int,
      data: Intent?
    ) {
      if (requestCode != FOLDER_PICKER_REQUEST_CODE) {
        return
      }

      val promise = folderPickerPromise
      folderPickerPromise = null

      if (promise == null) {
        return
      }

      if (resultCode != Activity.RESULT_OK) {
        promise.resolve(null)
        return
      }

      val uri = data?.data
      if (uri == null) {
        promise.resolve(null)
        return
      }

      try {
        val flags = data.flags and (
                Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )
        reactContext.contentResolver.takePersistableUriPermission(uri, flags)
      } catch (_: SecurityException) {
        // Some providers do not support persistable permissions, so continue with best effort.
      }

      promise.resolve(uri.toString())
    }
  }

  init {
    reactContext.addActivityEventListener(folderPickerEventListener)
  }

  override fun getName(): String = "StorageAccessModule"

  @ReactMethod
  fun saveFolderPaths(sourceUri: String, binUri: String, promise: Promise) {
    try {
      sharedPreferences.edit()
        .putString("sourceFolderUri", sourceUri)
        .putString("binFolderUri", binUri)
        .apply()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("SAVE_PATHS_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun getSavedFolderPaths(promise: Promise) {
    try {
      val sourceUri = sharedPreferences.getString("sourceFolderUri", null)
      val binUri = sharedPreferences.getString("binFolderUri", null)

      if (sourceUri == null || binUri == null) {
        promise.resolve(null)
        return
      }

      val result = Arguments.createMap().apply {
        putString("sourceFolderUri", sourceUri)
        putString("binFolderUri", binUri)
      }
      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("LOAD_PATHS_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun isManageExternalStorageGranted(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
        promise.resolve(true)
        return
      }

      promise.resolve(Environment.isExternalStorageManager())
    } catch (error: Exception) {
      promise.reject("CHECK_PERMISSION_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun openManageExternalStorageSettings(promise: Promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      promise.resolve(true)
      return
    }

    val globalIntent = Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    try {
      val packageName = reactContext.packageName
      val current = reactContext.currentActivity

      val appSpecificIntent = Intent(
        Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
        Uri.parse("package:$packageName"),
      ).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      if (current != null) {
        current.startActivity(appSpecificIntent)
      } else {
        reactContext.startActivity(appSpecificIntent)
      }

      promise.resolve(true)
    } catch (_: Exception) {
      try {
        reactContext.startActivity(globalIntent)
        promise.resolve(true)
      } catch (fallbackError: Exception) {
        promise.reject("OPEN_SETTINGS_FAILED", fallbackError.message, fallbackError)
      }
    }
  }

  @ReactMethod
  fun openFolderPicker(promise: Promise) {
    val current = reactContext.currentActivity
    if (current == null) {
      promise.reject("NO_ACTIVITY", "No active activity available to open folder picker.")
      return
    }

    if (folderPickerPromise != null) {
      promise.reject("PICKER_BUSY", "A folder picker request is already in progress.")
      return
    }

    folderPickerPromise = promise

    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
      addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
    }

    try {
      current.startActivityForResult(intent, FOLDER_PICKER_REQUEST_CODE)
    } catch (error: Exception) {
      folderPickerPromise = null
      promise.reject("OPEN_FOLDER_PICKER_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun openFolderInFileManager(folderUri: String, promise: Promise) {
    val current = reactContext.currentActivity
    if (current == null) {
      promise.reject("NO_ACTIVITY", "No active activity available to open the file manager.")
      return
    }

    try {
      val treeUri = Uri.parse(folderUri)
      val documentUri = DocumentsContract.buildDocumentUriUsingTree(
        treeUri,
        DocumentsContract.getTreeDocumentId(treeUri),
      )

      val intent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(documentUri, DocumentsContract.Document.MIME_TYPE_DIR)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      current.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      try {
        val treeIntent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
          putExtra(DocumentsContract.EXTRA_INITIAL_URI, Uri.parse(folderUri))
          addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
          addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
        }

        current.startActivity(treeIntent)
        promise.resolve(true)
      } catch (fallbackError: Exception) {
        promise.reject("OPEN_FOLDER_FAILED", fallbackError.message, fallbackError)
      }
    }
  }

  @ReactMethod
  fun getAllImageUrisInFolder(folderUri: String, promise: Promise) {
    try {
      val rootTreeUri = Uri.parse(folderUri)
      val documentId = DocumentsContract.getTreeDocumentId(rootTreeUri)
      val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(rootTreeUri, documentId)

      val results = Arguments.createArray()

      // We only request ID and MIME_TYPE to keep the database query fast
      val projection = arrayOf(
        DocumentsContract.Document.COLUMN_DOCUMENT_ID,
        DocumentsContract.Document.COLUMN_MIME_TYPE
      )

      reactContext.contentResolver.query(childrenUri, projection, null, null, null)?.use { cursor ->
        val idIndex = cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_DOCUMENT_ID)
        val mimeIndex = cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_MIME_TYPE)

        while (cursor.moveToNext()) {
          val mimeType = cursor.getString(mimeIndex)

          // Only process if it's an image and NOT a directory
          if (mimeType != null && mimeType.startsWith("image/")) {
            val docId = cursor.getString(idIndex)
            val fileUri = DocumentsContract.buildDocumentUriUsingTree(rootTreeUri, docId)
            results.pushString(fileUri.toString())
          }
        }
      }

      promise.resolve(results)
    } catch (e: Exception) {
      promise.reject("FETCH_IMAGE_URIS_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun listImageFiles(folderUri: String, alreadySwipedUris: ReadableArray, promise: Promise) {
    try {
      val treeUri = Uri.parse(folderUri)
      val swipedSet = alreadySwipedUris.toArrayList().mapNotNull { it as? String }.toSet()

      val allImageUris = mutableListOf<String>()

      // We use a stack for iterative (non-recursive) traversal
      val stack = mutableListOf<Uri>(treeUri)

      while (stack.isNotEmpty()) {
        val currentDirUri = stack.removeAt(stack.size - 1)

        // Build the URI to query the children of this specific directory
        val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(
          treeUri,
          DocumentsContract.getTreeDocumentId(currentDirUri)
        )

        val projection = arrayOf(
          DocumentsContract.Document.COLUMN_DOCUMENT_ID,
          DocumentsContract.Document.COLUMN_MIME_TYPE
        )

        reactContext.contentResolver.query(childrenUri, projection, null, null, null)
          ?.use { cursor ->
            val idIndex =
              cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_DOCUMENT_ID)
            val mimeIndex =
              cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_MIME_TYPE)

            while (cursor.moveToNext()) {
              val docId = cursor.getString(idIndex)
              val mimeType = cursor.getString(mimeIndex)
              val childUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, docId)
              val childUriString = childUri.toString()

              if (mimeType == DocumentsContract.Document.MIME_TYPE_DIR) {
                // Add subdirectory to stack for later processing
                stack.add(childUri)
              } else if (mimeType.startsWith("image/")) {
                // Add image to our pool if not already swiped
                if (!swipedSet.contains(childUriString)) {
                  allImageUris.add(childUriString)
                }
              }
            }
          }
      }

      // Randomly pick 16 from the entire pool
      val randomSelection = allImageUris.shuffled().take(16)

      val result = Arguments.createArray()
      randomSelection.forEach { result.pushString(it) }

      promise.resolve(result)

    } catch (e: Exception) {
      promise.reject("LIST_IMAGES_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun moveToBin(sourceUri: String, binUri: String, promise: Promise) {
    try {
      val src = DocumentFile.fromSingleUri(reactContext, Uri.parse(sourceUri))
      val destDir = DocumentFile.fromTreeUri(reactContext, Uri.parse(binUri))
      if (src == null || !src.exists() || destDir == null || !destDir.exists()) {
        promise.resolve(false)
        return
      }

      val name = src.name ?: "file"
      val mime = try {
        reactContext.contentResolver.getType(src.uri)
      } catch (_: Exception) {
        "application/octet-stream"
      }

      val destFile = destDir.createFile(mime ?: "application/octet-stream", name)
      if (destFile == null) {
        promise.resolve(false)
        return
      }

      var input: InputStream? = null
      var output: OutputStream? = null
      try {
        input = reactContext.contentResolver.openInputStream(src.uri)
        output = reactContext.contentResolver.openOutputStream(destFile.uri)
        if (input == null || output == null) throw IOException("Unable to open streams")
        val buffer = ByteArray(8192)
        var read: Int
        while (input.read(buffer).also { read = it } != -1) {
          output.write(buffer, 0, read)
        }
        output.flush()
      } finally {
        try {
          input?.close()
        } catch (_: Exception) {
        }
        try {
          output?.close()
        } catch (_: Exception) {
        }
      }

      val deleted = src.delete()
      promise.resolve(deleted)
    } catch (error: Exception) {
      promise.reject("MOVE_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun getImageMetadata(fileUri: String, promise: Promise) {
    try {
      val uri = Uri.parse(fileUri)

      // On Android 10+, location data is redacted by default for content URIs.
      // We use setRequireOriginal to request unredacted GPS tags.
      val photoUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        try {
          MediaStore.setRequireOriginal(uri)
        } catch (_: Exception) {
          uri
        }
      } else {
        uri
      }

      reactContext.contentResolver.openInputStream(photoUri)?.use { inputStream ->
        val exif = ExifInterface(inputStream)
        val dateTime = exif.getAttribute(ExifInterface.TAG_DATETIME)
        //val latLong = exif.getLatLong()
        val latLong = exif.latLong
        val result = Arguments.createMap().apply {
          putString("dateTime", dateTime)
          if (latLong != null && latLong.size >= 2) {
            putDouble("lat", latLong[0])
            putDouble("lon", latLong[1])
          } else {
            putNull("lat")
            putNull("lon")
          }
        }
        promise.resolve(result)
      } ?: promise.reject("METADATA_FAILED", "Could not open input stream")
    } catch (e: Exception) {
      promise.reject("METADATA_FAILED", e.message, e)
    }
  }
}
