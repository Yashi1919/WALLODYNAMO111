package com.wallodynamo

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import androidx.core.app.NotificationManagerCompat

class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AlarmModule"
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun setAlarm(timeInMillis: Int, imageUri: String, requestCode: Int, promise: Promise) {
        val alarmManager = reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        // Check if notifications are enabled
        if (!areNotificationsEnabled()) {
            Log.e("AlarmModule", "Notifications are not enabled for this app.")
            promise.reject("NOTIFICATIONS_DISABLED", "Notifications are not enabled for this app.")
            return
        }

        // Check if we can schedule exact alarms, required from Android 12 (S)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                Log.e("AlarmModule", "Exact Alarm Permission not granted")

                // Request permission for scheduling exact alarms
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                        data = Uri.parse("package:${reactApplicationContext.packageName}")
                    }
                    currentActivity?.startActivity(intent)  // Start the permission request
                    promise.reject("EXACT_ALARM_PERMISSION_DENIED", "Exact alarm permission not granted.")
                    return
                } else {
                    Log.e("AlarmModule", "Cannot set exact alarm without permission")
                    promise.reject("EXACT_ALARM_PERMISSION_DENIED", "Cannot set exact alarm without permission.")
                    return  // Exit if the permission is not granted
                }
            } else {
                Log.d("AlarmModule", "Exact Alarm Permission granted, proceeding with scheduling")
            }
        }

        // Prepare the intent for the alarm
        val intent = Intent(reactApplicationContext, AlarmReceiver::class.java).apply {
            putExtra("imageUri", imageUri)
            putExtra("requestCode", requestCode)  // Pass the requestCode
        }

        // Create a PendingIntent with a unique request code for each alarm
        val pendingIntent = PendingIntent.getBroadcast(
            reactApplicationContext,
            requestCode,  // Use requestCode to differentiate between alarms
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Set the alarm with the exact time
        alarmManager.setExact(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + timeInMillis, pendingIntent)

        // Notify the promise that the alarm has been set successfully
        promise.resolve("Alarm set successfully")
    }

    private fun areNotificationsEnabled(): Boolean {
        val notificationManager = NotificationManagerCompat.from(reactApplicationContext)
        return notificationManager.areNotificationsEnabled()
    }
}
