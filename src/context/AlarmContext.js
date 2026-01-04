import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Vibration, Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as Notifications from 'expo-notifications';
import { playAlarmSound, stopAlarmSound } from '@/services/AudioService';
import { scheduleAlarm as serviceScheduleAlarm, cancelAlarmNotification } from '@/services/AlarmService';

const AlarmContext = createContext();

export const useAlarm = () => useContext(AlarmContext);

export const AlarmProvider = ({ children }) => {
    const [alarms, setAlarms] = useState([]);
    const [isAlarmRinging, setAlarmRinging] = useState(false);
    const [alarmMetadata, setAlarmMetadata] = useState(null);

    // Lock to prevent duplicate async triggers
    const isTriggerProcessing = React.useRef(false);

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

            console.log(`[AlarmContext] Notification received. Target in: ${diff}ms`);

            // If it's too early (> 3 seconds), SILENCE IT.
            // This catches "immediate" notifications that fired wrongly.
            if (diff > 3000) {
                console.log(`[AlarmContext] Too early. Suppressing immediate trigger. Waiting ${diff}ms.`);

                // Set a timer to wake up later
                setTimeout(() => {
                    console.log("[AlarmContext] Wait finished. Triggering now.");
                    triggerAlarm(data);
                }, diff);

                return; // EXIT - DO NOT RING NOW
            }
        }
        triggerAlarm(data);
    };

    const triggerAlarm = async (data = {}) => {
        // Double Check Locking
        if (isAlarmRinging || isTriggerProcessing.current) {
            console.log("Alarm active or processing. Ignoring duplicate.");
            return;
        }

        try {
            isTriggerProcessing.current = true;
            console.log("ALARM TRIGGERED! Playing Sound...");

            // 1. Play Sound (Global Service)
            await playAlarmSound();

            // 2. Update State (Show UI)
            setAlarmMetadata(data);
            setAlarmRinging(true);
        } catch (e) {
            console.error(e);
        } finally {
            // Unlock after a brief delay to ensure state has propagated
            setTimeout(() => {
                isTriggerProcessing.current = false;
            }, 1000);
        }
    };

    const stopAlarm = async () => {
        try {
            console.log("Stopping Alarm UI & Sound...");

            // 1. Stop Sound (Global Service)
            await stopAlarmSound();

            // 2. Hide UI
            setAlarmRinging(false);
            setAlarmMetadata(null);
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

        // Pass targetTime and metadata for verification and UI
        const notificationId = await serviceScheduleAlarm(targetDate, {
            targetTime: targetDate.toISOString(),
            label,
            dismissMode
        });

        Alert.alert("DEBUG: Alarm Set", `Scheduled for:\n${targetDate.toLocaleTimeString()}`);

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
