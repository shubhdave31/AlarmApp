import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert, Vibration } from 'react-native';
import { useAlarm } from '@/context/AlarmContext';
import Colors from '@/constants/Colors';

export default function AlarmCard({ alarm }) {
    const { toggleAlarm, deleteAlarm } = useAlarm();
    const date = new Date(alarm.time);

    // Format time (e.g., 08:30)
    const timeString = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const handleDelete = () => {
        Alert.alert('Delete Alarm', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    Vibration.vibrate(50);
                    deleteAlarm(alarm.id);
                }
            }
        ]);
    };

    return (
        <View style={styles.cardContainer}>
            <View style={styles.content}>
                <View style={styles.info}>
                    <Text style={[styles.time, !alarm.active && styles.timeInactive]}>
                        {timeString}
                    </Text>
                    <Text style={styles.label}>{alarm.label}</Text>
                </View>

                <View style={styles.controls}>
                    <Switch
                        value={alarm.active}
                        onValueChange={() => toggleAlarm(alarm.id)}
                        trackColor={{ false: '#3A3A3C', true: '#32D74B' }} // iOS Green
                        thumbColor={'#fff'}
                    />
                    <TouchableOpacity onPress={handleDelete} hitSlop={10}>
                        <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    info: {
        gap: 2,
    },
    time: {
        fontSize: 52,
        fontFamily: 'Inter_300Light',
        color: '#fff',
        letterSpacing: -1,
    },
    timeInactive: {
        opacity: 0.5,
    },
    label: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: Colors.dark.textSecondary,
    },
    controls: {
        alignItems: 'flex-end',
        gap: 12,
    },
    deleteText: {
        color: '#FF453A', // System Red
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        marginTop: 4,
    },
});
