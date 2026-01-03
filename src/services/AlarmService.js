import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const scheduleAlarm = async (seconds, extraData = {}) => {
    await requestPermissions();

    const triggerSeconds = Math.max(1, Math.floor(seconds));

    // DEBUG: Log to console instead of Alert
    console.log(`[AlarmService] Scheduling for: ${triggerSeconds} seconds`);

    console.log(`[AlarmService] Scheduling for: ${triggerSeconds}s`);

    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Alarm Set",
                body: "Waiting for target time...",
                sound: false, // SILENT
                priority: Notifications.AndroidNotificationPriority.LOW,
                data: { type: 'ALARM_TRIGGER', ...extraData },
            },
            trigger: {
                seconds: triggerSeconds,
                channelId: 'default',
                repeats: false,
            },
        });
        return id;
    } catch (error) {
        console.error("Failed to schedule notification:", error);
        return null;
    }
};

export const cancelAlarmNotification = async (notificationId) => {
    if (!notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`[AlarmService] Cancelled notification: ${notificationId}`);
    } catch (error) {
        console.warn("Failed to cancel notification:", error);
    }
};

const requestPermissions = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.LOW, // LOW
            vibrationPattern: null, // NO VIBRATION
            lightColor: '#FF231F7C',
        });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('Permission not granted to show notifications');
    }
};
