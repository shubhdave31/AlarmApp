import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const scheduleAlarm = async (triggerInput, extraData = {}) => {
    await requestPermissions();

    let trigger;
    let logMsg;

    // Simplify Trigger Logic: Always use Seconds (TimeInterval) to ensure Channel ID support
    let seconds;
    if (triggerInput instanceof Date) {
        logMsg = `Timestamp: ${triggerInput.toLocaleString()}`;
        const now = new Date().getTime();
        const diff = (triggerInput.getTime() - now) / 1000;
        seconds = Math.max(1, Math.floor(diff));
        logMsg += ` (in ${seconds}s)`;
    } else {
        seconds = Math.max(1, Math.floor(triggerInput));
        logMsg = `Seconds: ${seconds}`;
    }

    // Explicitly use TimeIntervalTrigger with Type and ChannelID
    trigger = {
        type: 'timeInterval',
        seconds,
        channelId: 'alarm-max-v2',
        repeats: false
    };

    // DEBUG: Log to console
    console.log(`[AlarmService] Scheduling via ${logMsg}`);

    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Wake Up!",
                body: extraData.label || "Time to get up!",
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.MAX,
                data: { type: 'ALARM_TRIGGER', ...extraData },
                autoDismiss: false,
                sticky: true,
                channelId: 'alarm-max-v2',
            },
            trigger,
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
        // Use a NEW channel ID to force update settings on the device
        await Notifications.setNotificationChannelAsync('alarm-max-v2', {
            name: 'Max Priority Alarm',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 500, 500],
            lightColor: '#FF231F7C',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true,
            sound: 'default',
        });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('Permission not granted to show notifications');
    }
};
