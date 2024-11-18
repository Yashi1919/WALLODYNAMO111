package com.wallodynamo

import android.app.WallpaperManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.io.InputStream

class WallpaperChangeReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        Log.d("WallpaperChangeReceiver", "Alarm received for wallpaper change")

        // Extract image URIs and interval from the intent
        val imageUris = intent.getStringArrayListExtra("imageUris")
        val intervalInMillis = intent.getIntExtra("intervalInMillis", 5000)

        if (imageUris != null && imageUris.isNotEmpty()) {
            // Start wallpaper change handler
            startWallpaperChanges(context, imageUris, intervalInMillis)
        } else {
            Log.e("WallpaperChangeReceiver", "No image URIs provided!")
        }
    }

    private fun startWallpaperChanges(context: Context, images: ArrayList<String>, intervalInMillis: Int) {
        val handler = Handler(Looper.getMainLooper())
        var currentImageIndex = 0

        val wallpaperRunnable = object : Runnable {
            override fun run() {
                if (images.isNotEmpty()) {
                    val imageUri = images[currentImageIndex % images.size]
                    Log.d("WallpaperChangeReceiver", "Changing wallpaper to: $imageUri")

                    // Call the method to set the wallpaper
                    setWallpaper(context, imageUri)

                    // Update index and schedule next wallpaper change
                    currentImageIndex++
                    handler.postDelayed(this, intervalInMillis.toLong())
                }
            }
        }

        // Start the wallpaper change loop
        handler.post(wallpaperRunnable)
    }

    private fun setWallpaper(context: Context, imageUri: String) {
        try {
            // Get WallpaperManager instance
            val wallpaperManager = WallpaperManager.getInstance(context)

            // Open the image stream from the provided URI
            val inputStream: InputStream? = context.contentResolver.openInputStream(Uri.parse(imageUri))

            if (inputStream != null) {
                // Set the wallpaper
                wallpaperManager.setStream(inputStream)
                Log.d("WallpaperChangeReceiver", "Wallpaper changed successfully to $imageUri")
                
                // Close the input stream after setting the wallpaper
                inputStream.close()
            } else {
                Log.e("WallpaperChangeReceiver", "Failed to open input stream for $imageUri")
            }
        } catch (e: Exception) {
            Log.e("WallpaperChangeReceiver", "Error setting wallpaper: ${e.message}", e)
        }
    }
}
