import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Vibration, Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as Notifications from 'expo-notifications';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av'; // Fixed Imports
import { scheduleAlarm as serviceScheduleAlarm, cancelAlarmNotification } from '@/services/AlarmService';

const AlarmContext = createContext();

export const useAlarm = () => useContext(AlarmContext);

export const AlarmProvider = ({ children }) => {
    const [alarms, setAlarms] = useState([]);
    const [isAlarmRinging, setAlarmRinging] = useState(false);
    const [alarmMetadata, setAlarmMetadata] = useState(null);
    const soundRef = React.useRef(null); // Use Ref for persistent sound object

    // Listener for Notifications
    useEffect(() => {
        // Foreground Listener
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            const data = notification.request.content.data;
            if (data?.type === 'ALARM_TRIGGER') {
                handleNotificationTrigger(data);
            }
        });

        // Background/Response Listener
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.type === 'ALARM_TRIGGER') {
                handleNotificationTrigger(data);
            }
        });

        return () => {
            subscription.remove();
            responseSubscription.remove();
        };
    }, []);

    const handleNotificationTrigger = async (data) => {
        if (data?.targetTime) {
            const now = new Date().getTime();
            const target = new Date(data.targetTime).getTime();
            const diff = target - now;

            // If it's too early (>10s), don't trigger UI. 
            // Instead, wait for the remaining time using JS.
            if (diff > 10000) {
                console.log(`[AlarmContext] Early trigger. Waiting ${diff}ms in JS.`);

                // Fallback: Use JS timer to finish the wait
                setTimeout(() => {
                    triggerAlarm(data);
                }, diff);

                return;
            }
        }
        triggerAlarm(data);
    };

    const triggerAlarm = async (data = {}) => {
        if (isAlarmRinging) {
            console.log("Alarm already ringing, ignoring duplicate trigger.");
            return;
        }
        console.log("ALARM TRIGGERED! Playing Sound...");
        setAlarmRinging(true);
        setAlarmMetadata(data);

        // Stop any previous sound if it exists just in case
        if (soundRef.current) {
            try {
                await soundRef.current.unloadAsync();
            } catch (e) {
                console.log("Cleanup error:", e);
            }
            soundRef.current = null;
        }

        // Play Sound
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                playThroughEarpieceAndroid: false,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                // Using a default URI for now (Standard Beep)
                { uri: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
                { shouldPlay: true, isLooping: true, volume: 1.0 }
            );
            soundRef.current = newSound;
            await newSound.playAsync();
        } catch (error) {
            console.error("Failed to play alarm sound", error);
            Alert.alert("Error", "Could not play sound.");
        }
    };

    const stopAlarm = async () => {
        try {
            setAlarmRinging(false);
            setAlarmMetadata(null);
            // Stop Sound
            if (soundRef.current) {
                console.log("Stopping Sound...");
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        } catch (error) {
            console.error("Error stopping alarm:", error);
        }
    };

    const addAlarm = async (timeString, label = 'Alarm', dismissMode = 'face') => {
        const inputTime = new Date(timeString);
        const now = new Date();

        // Create target date based on today's date but inputTime's hours/minutes
        let targetDate = new Date();
        targetDate.setHours(inputTime.getHours(), inputTime.getMinutes(), 0, 0);

        // If target is in the past, add 1 day
        if (targetDate <= now) {
            console.log('[AlarmContext] Target is past/now, moving to tomorrow');
            targetDate.setDate(targetDate.getDate() + 1);
        }

        console.log(`[AlarmContext] Scheduling for: ${targetDate.toLocaleString()}`);

        // Calculate verified seconds
        const finalDiff = (targetDate.getTime() - new Date().getTime()) / 1000;
        const finalSeconds = Math.max(1, finalDiff);

        // Pass targetTime and metadata for verification and UI
        const notificationId = await serviceScheduleAlarm(finalSeconds, {
            targetTime: targetDate.toISOString(),
            label,
            dismissMode
        });

        const newAlarm = {
            id: uuidv4(),
            time: targetDate.toISOString(), // Store the *computed* target time
            label,
            dismissMode,
            active: true,
            notificationId,
        };
        setAlarms((prev) => [...prev, newAlarm]);
    };

    const toggleAlarm = async (id) => {
        const alarm = alarms.find(a => a.id === id);
        if (!alarm) return;

        const newActive = !alarm.active;
        let newNotificationId = alarm.notificationId;

        if (!newActive) {
            // Turning OFF: Cancel
            if (alarm.notificationId) {
                await cancelAlarmNotification(alarm.notificationId);
                newNotificationId = null;
            }
        } else {
            // Turning ON: Reschedule
            const originalTime = new Date(alarm.time);
            const now = new Date();

            let targetDate = new Date();
            targetDate.setHours(originalTime.getHours(), originalTime.getMinutes(), 0, 0);

            if (targetDate <= now) {
                targetDate.setDate(targetDate.getDate() + 1);
            }

            console.log(`[AlarmContext] Rescheduling toggled alarm for: ${targetDate.toLocaleString()}`);

            const finalDiff = (targetDate.getTime() - new Date().getTime()) / 1000;
            const finalSeconds = Math.max(1, finalDiff);

            // Re-schedule with ORIGINAL metadata (label, dismissMode)
            newNotificationId = await serviceScheduleAlarm(finalSeconds, {
                targetTime: targetDate.toISOString(),
                label: alarm.label,
                dismissMode: alarm.dismissMode
            });
        }

        setAlarms((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, active: newActive, notificationId: newNotificationId } : a
            )
        );
    };

    const deleteAlarm = (id) => {
        setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    };

    return (
        <AlarmContext.Provider
            value={{
                alarms,
                addAlarm,
                toggleAlarm,
                deleteAlarm,
                isAlarmRinging,
                alarmMetadata,
                stopAlarm
            }}
        >
            {children}
        </AlarmContext.Provider>
    );
};
