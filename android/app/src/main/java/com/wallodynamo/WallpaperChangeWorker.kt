package com.wallodynamo

import android.app.WallpaperManager
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.work.*
import java.io.InputStream
import java.util.concurrent.TimeUnit

class WallpaperChangeWorker(context: Context, params: WorkerParameters) : Worker(context, params) {

    override fun doWork(): Result {
        // Get the list of image URIs passed through inputData
        val imageUris = inputData.getStringArray("imageUris") ?: return Result.failure()
        val intervalInMillis = inputData.getInt("intervalInMillis", 5000)
        val currentIndex = inputData.getInt("currentIndex", 0)

        return try {
            // Set wallpaper using the current image URI
            val imageUri = imageUris[currentIndex % imageUris.size]
            setWallpaper(applicationContext, imageUri)

            // Schedule the next wallpaper change
            scheduleNextWallpaperChange(imageUris, currentIndex + 1, intervalInMillis)

            Result.success()
        } catch (e: Exception) {
            Log.e("WallpaperChangeWorker", "Error setting wallpaper: ${e.message}", e)
            Result.failure()
        }
    }

    // Method to set wallpaper from the given URI
    private fun setWallpaper(context: Context, imageUri: String) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(context)
            context.contentResolver.openInputStream(Uri.parse(imageUri))?.use { inputStream ->
                wallpaperManager.setStream(inputStream)
                Log.d("WallpaperChangeWorker", "Wallpaper changed successfully to $imageUri")
            } ?: run {
                Log.e("WallpaperChangeWorker", "Failed to open input stream for $imageUri")
            }
        } catch (e: Exception) {
            Log.e("WallpaperChangeWorker", "Error setting wallpaper: ${e.message}", e)
        }
    }

    // Method to schedule the next wallpaper change with updated index
    private fun scheduleNextWallpaperChange(imageUris: Array<String>, nextIndex: Int, intervalInMillis: Int) {
        val workManager = WorkManager.getInstance(applicationContext)

        // Prepare data for the next wallpaper change
        val inputData = Data.Builder()
            .putStringArray("imageUris", imageUris)
            .putInt("currentIndex", nextIndex)
            .putInt("intervalInMillis", intervalInMillis)
            .build()

        // Schedule next wallpaper change after the specified interval
        val nextWallpaperChangeRequest = OneTimeWorkRequestBuilder<WallpaperChangeWorker>()
            .setInitialDelay(intervalInMillis.toLong(), TimeUnit.MILLISECONDS)
            .setInputData(inputData)
            .addTag("WallpaperChangeWork")
            .build()

        workManager.enqueue(nextWallpaperChangeRequest)
    }
}
