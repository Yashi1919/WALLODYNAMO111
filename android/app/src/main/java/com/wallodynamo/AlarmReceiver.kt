package com.wallodynamo

import android.app.WallpaperManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import java.io.IOException

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        // Retrieve the image URI from the intent
        val imageUri = intent.getStringExtra("imageUri")
        val requestCode = intent.getIntExtra("requestCode", -1) // Get unique request code

        if (imageUri != null) {
            try {
                // Get the WallpaperManager instance
                val wallpaperManager = WallpaperManager.getInstance(context)

                // Convert the URI to input stream and set it as wallpaper
                val inputStream = context.contentResolver.openInputStream(Uri.parse(imageUri))

                if (inputStream != null) {
                    wallpaperManager.setStream(inputStream)
                    Toast.makeText(context, "Wallpaper updated for alarm with requestCode $requestCode!", Toast.LENGTH_SHORT).show()
                    Log.d("AlarmReceiver", "Wallpaper updated for requestCode: $requestCode")
                } else {
                    Toast.makeText(context, "Failed to open image URI", Toast.LENGTH_SHORT).show()
                    Log.e("AlarmReceiver", "Failed to open image URI for requestCode: $requestCode")
                }
            } catch (e: IOException) {
                e.printStackTrace()
                Toast.makeText(context, "Failed to set wallpaper", Toast.LENGTH_SHORT).show()
                Log.e("AlarmReceiver", "Failed to set wallpaper for requestCode: $requestCode")
            }
        } else {
            Toast.makeText(context, "No image URI provided", Toast.LENGTH_SHORT).show()
            Log.e("AlarmReceiver", "No image URI provided for requestCode: $requestCode")
        }
    }
}
