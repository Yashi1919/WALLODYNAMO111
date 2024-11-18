package com.wallodynamo

import android.content.Intent
import android.provider.Settings
import android.os.Build
import android.app.Activity
import android.content.Context
import androidx.annotation.NonNull
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AlarmPermissionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AlarmPermissionModule"
    }

    @ReactMethod
    fun requestExactAlarmPermission(promise: Promise) {
        val currentActivity: Activity? = currentActivity
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {  // Android 12 (API 31) and higher
            try {
                val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                currentActivity?.startActivity(intent)
                promise.resolve(true)  // Notify JS that permission request started
            } catch (e: Exception) {
                promise.reject("PERMISSION_ERROR", "Failed to request exact alarm permission: ${e.message}")
            }
        } else {
            promise.reject("PERMISSION_NOT_REQUIRED", "Exact alarm permission is only required on Android 12 and higher.")
        }
    }
}
