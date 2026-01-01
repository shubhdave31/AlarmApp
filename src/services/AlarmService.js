import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const scheduleAlarm = async (secondsFromNow = 5) => {
    await requestPermissions();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "WAKE UP!",
            body: "Open your eyes to dismiss!",
            sound: true,
            data: { type: 'ALARM_TRIGGER' },
        },
        trigger: {
            seconds: secondsFromNow,
        },
    });
};

const requestPermissions = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('Permission not granted to show notifications');
    }
};
