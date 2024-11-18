package com.wallodynamo

import android.app.WallpaperManager
import android.app.job.JobParameters
import android.app.job.JobService
import android.content.Context
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.io.InputStream

class WallpaperChangeJobService : JobService() {

    private var handler: Handler? = null
    private var currentImageIndex = 0

    override fun onStartJob(params: JobParameters?): Boolean {
        Log.d("WallpaperChangeJobService", "Job started for wallpaper change")

        val imageUris = params?.extras?.getStringArray("imageUris")?.toList()
        val intervalInMillis = params?.extras?.getInt("intervalInMillis", 5000) ?: 5000

        if (imageUris != null && imageUris.isNotEmpty()) {
            startWallpaperChanges(applicationContext, ArrayList(imageUris), intervalInMillis)
        } else {
            Log.e("WallpaperChangeJobService", "No image URIs provided or URIs list is empty.")
        }

        return true
    }

    override fun onStopJob(params: JobParameters?): Boolean {
        handler?.removeCallbacksAndMessages(null)
        return true
    }

    private fun startWallpaperChanges(context: Context, images: ArrayList<String>, intervalInMillis: Int) {
        if (handler == null) {
            handler = Handler(Looper.getMainLooper())
        }

        val wallpaperRunnable = object : Runnable {
            override fun run() {
                if (images.isNotEmpty()) {
                    val imageUri = images[currentImageIndex % images.size]
                    Log.d("WallpaperChangeJobService", "Attempting to change wallpaper to: $imageUri")

                    // Check if the wallpaper change is successful
                    val result = setWallpaper(context, imageUri)

                    if (result) {
                        Log.d("WallpaperChangeJobService", "Wallpaper changed successfully.")
                    } else {
                        Log.e("WallpaperChangeJobService", "Failed to change wallpaper to: $imageUri")
                    }

                    currentImageIndex++
                    handler?.postDelayed(this, intervalInMillis.toLong())
                }
            }
        }

        handler?.post(wallpaperRunnable)
    }

    private fun setWallpaper(context: Context, imageUri: String): Boolean {
        return try {
            val wallpaperManager = WallpaperManager.getInstance(context)
            val inputStream: InputStream? = context.contentResolver.openInputStream(Uri.parse(imageUri))

            if (inputStream != null) {
                wallpaperManager.setStream(inputStream)
                inputStream.close()
                true // Return true if wallpaper was set successfully
            } else {
                Log.e("WallpaperChangeJobService", "InputStream is null for URI: $imageUri")
                false
            }
        } catch (e: Exception) {
            Log.e("WallpaperChangeJobService", "Error setting wallpaper: ${e.message}", e)
            false
        }
    }
}
  