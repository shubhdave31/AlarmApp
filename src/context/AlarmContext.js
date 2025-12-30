import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Vibration, Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const AlarmContext = createContext();

export const useAlarm = () => useContext(AlarmContext);

export const AlarmProvider = ({ children }) => {
    const [alarms, setAlarms] = useState([]);

    // Load alarms from storage if we had persistence (skipping for now)

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            alarms.forEach((alarm) => {
                if (alarm.isActive) {
                    const alarmTime = new Date(alarm.time);
                    if (
                        now.getHours() === alarmTime.getHours() &&
                        now.getMinutes() === alarmTime.getMinutes() &&
                        now.getSeconds() === 0
                    ) {
                        triggerAlarm(alarm);
                    }
                }
            });
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, [alarms]);

    const triggerAlarm = (alarm) => {
        // In a real app, this would use expo-notifications.
        // For now, we simulate an active alarm.
        Vibration.vibrate();
        Alert.alert('Alarm!', `It is time for ${alarm.label || 'Alarm'}`, [
            { text: 'Stop', onPress: () => toggleAlarm(alarm.id) },
        ]);
    };

    const addAlarm = (time, label = 'Alarm') => {
        const newAlarm = {
            id: uuidv4(),
            time,
            label,
            isActive: true,
        };
        setAlarms((prev) => [...prev, newAlarm]);
    };

    const toggleAlarm = (id) => {
        setAlarms((prev) =>
            prev.map((alarm) =>
                alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
            )
        );
    };

    const deleteAlarm = (id) => {
        setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    };

    return (
        <AlarmContext.Provider
            value={{ alarms, addAlarm, toggleAlarm, deleteAlarm }}
        >
            {children}
        </AlarmContext.Provider>
    );
};
