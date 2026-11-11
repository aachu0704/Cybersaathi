package com.cybersathi.app

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import androidx.annotation.NonNull
import androidx.core.app.NotificationManagerCompat
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.cybersathi.app/notification_service"

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "isPermissionGranted" -> {
                    val isGranted = checkNotificationListenerPermission()
                    result.success(isGranted)
                }
                "openPermissionSettings" -> {
                    try {
                        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                        startActivity(intent)
                        result.success(true)
                    } catch (e: Exception) {
                        result.error("SETTINGS_ERROR", e.localizedMessage, null)
                    }
                }
                "getCapturedNotifications" -> {
                    val notifications = CyberSathiNotificationListener.capturedNotifications.toList()
                    result.success(notifications)
                }
                "clearNotifications" -> {
                    CyberSathiNotificationListener.clearNotifications()
                    result.success(true)
                }
                "setMonitoringEnabled" -> {
                    val enabled = call.argument<Boolean>("enabled") ?: true
                    CyberSathiNotificationListener.isMonitoringEnabled = enabled
                    result.success(true)
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }

    private fun checkNotificationListenerPermission(): Boolean {
        val packageName = applicationContext.packageName
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        if (flat != null && flat.isNotEmpty()) {
            val names = flat.split(":".toRegex()).toTypedArray()
            for (name in names) {
                val cn = ComponentName.unflattenFromString(name)
                if (cn != null && cn.packageName == packageName) {
                    return true
                }
            }
        }
        return false
    }
}
