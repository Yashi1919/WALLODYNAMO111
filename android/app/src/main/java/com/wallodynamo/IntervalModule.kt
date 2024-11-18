package com.wallodynamo

import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Data
import androidx.work.WorkRequest
import androidx.work.ExistingWorkPolicy
import android.content.Context
import androidx.work.*
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import java.util.concurrent.TimeUnit

class IntervalModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "IntervalModule"
    }

    @ReactMethod
    fun scheduleWallpaperChange(imageUris: ReadableArray, intervalInMillis: Int, promise: Promise) {
        try {
            val workManager = WorkManager.getInstance(reactContext)

            // Convert ReadableArray to List<String>
            val images = mutableListOf<String>()
            for (i in 0 until imageUris.size()) {
                images.add(imageUris.getString(i) ?: "")
            }

            if (images.isEmpty()) {
                promise.reject("No images provided", "You must provide at least one image to schedule wallpaper changes.")
                return
            }

            // Cancel any existing wallpaper changes
            workManager.cancelAllWorkByTag("WallpaperChangeWork")

            // Schedule the first wallpaper change and keep it looping
            val inputData = Data.Builder()
                .putStringArray("imageUris", images.toTypedArray())
                .putInt("intervalInMillis", intervalInMillis)
                .build()

            val wallpaperChangeRequest = OneTimeWorkRequestBuilder<WallpaperChangeWorker>()
                .setInitialDelay(intervalInMillis.toLong(), TimeUnit.MILLISECONDS)
                .setInputData(inputData)
                .addTag("WallpaperChangeWork")
                .build()

            // Start with unique chain work to ensure continuous execution
            workManager.beginUniqueWork(
                "WallpaperChangeWorkChain",
                ExistingWorkPolicy.REPLACE,
                wallpaperChangeRequest
            ).enqueue()

            promise.resolve("Wallpaper change scheduled successfully.")
        } catch (e: Exception) {
            promise.reject("Error scheduling wallpaper change", e)
        }
    }

    @ReactMethod
    fun cancelWallpaperChange(promise: Promise?) {
        try {
            WorkManager.getInstance(reactContext).cancelAllWorkByTag("WallpaperChangeWork")
            promise?.resolve("All wallpaper change tasks cancelled successfully.")
        } catch (e: Exception) {
            promise?.reject("Error cancelling wallpaper changes", e)
        }
    }
}
