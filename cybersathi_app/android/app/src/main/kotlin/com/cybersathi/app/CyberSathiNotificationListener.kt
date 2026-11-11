package com.cybersathi.app

import android.app.Notification
import android.content.Intent
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import java.util.concurrent.CopyOnWriteArrayList

/**
 * CyberSathi NotificationListenerService
 * 
 * Inspects incoming notification text for known scam/fraud indicators when explicitly enabled
 * by the user in Android Notification Access settings.
 * 
 * Privacy & Security Guarantees:
 * 1. Only reads notification title and content text.
 * 2. Does NOT access private chat databases or device SMS stores.
 * 3. In-memory buffer of recent items; monitoring can be toggled OFF instantly by user.
 */
class CyberSathiNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "CyberSathiNotifListener"
        var isMonitoringEnabled: Boolean = true

        // Thread-safe ring buffer for captured notifications (max 30 items)
        val capturedNotifications = CopyOnWriteArrayList<Map<String, Any>>()
        private const val MAX_BUFFER_SIZE = 30

        fun clearNotifications() {
            capturedNotifications.clear()
        }

        // Package prefixes to skip (system notifications)
        private val IGNORED_PACKAGES = setOf(
            "android",
            "com.android.systemui",
            "com.google.android.googlequicksearchbox",
            "com.android.settings"
        )
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (!isMonitoringEnabled || sbn == null) return

        val packageName = sbn.packageName ?: return
        if (IGNORED_PACKAGES.contains(packageName)) return

        val extras = sbn.notification.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString() ?: ""

        val combinedContent = if (subText.isNotEmpty()) "$title - $text ($subText)" else "$title - $text"

        // Ignore empty notifications or music playback notifications
        if (combinedContent.trim().isEmpty() || combinedContent.length < 5) return

        Log.d(TAG, "Captured notification from $packageName: $title")

        val item = mapOf(
            "id" to sbn.id.toString(),
            "packageName" to packageName,
            "title" to title,
            "text" to text,
            "fullText" to combinedContent,
            "timestamp" to sbn.postTime
        )

        // Maintain buffer size
        if (capturedNotifications.size >= MAX_BUFFER_SIZE) {
            capturedNotifications.removeAt(0)
        }
        capturedNotifications.add(item)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "CyberSathi NotificationListenerService successfully connected.")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.i(TAG, "CyberSathi NotificationListenerService disconnected.")
    }
}
