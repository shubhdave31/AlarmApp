import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useAlarm } from '@/context/AlarmContext';
import Colors from '@/constants/Colors';

export default function AlarmCard({ alarm }) {
    const { toggleAlarm, deleteAlarm } = useAlarm();
    const date = new Date(alarm.time);

    // Format time (e.g., 08:30 AM)
    const timeString = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.time}>{timeString}</Text>
                <Text style={styles.label}>{alarm.label}</Text>
            </View>
            <View style={styles.actions}>
                <Switch
                    value={alarm.isActive}
                    onValueChange={() => toggleAlarm(alarm.id)}
                    trackColor={{ false: '#767577', true: Colors.light.tint }}
                    thumbColor={alarm.isActive ? '#fff' : '#f4f3f4'}
                />
                <TouchableOpacity
                    onPress={() => deleteAlarm(alarm.id)}
                    style={styles.deleteBtn}
                >
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.dark.surface,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        padding: 24,
        borderRadius: 20,
        marginBottom: 16,
        // Glassmorphism shadow hint
        shadowColor: Colors.dark.tint,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    info: {
        flex: 1,
    },
    time: {
        fontSize: 56,
        fontWeight: '100', // Ultra-thin
        color: Colors.dark.text,
        letterSpacing: -2,
        fontVariant: ['tabular-nums'],
    },
    label: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        marginTop: 0,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    actions: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 16,
    },
    deleteBtn: {
        padding: 8,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 8,
    },
    deleteText: {
        color: '#FF453A', // iOS Red
        fontSize: 12,
        fontWeight: '700',
    },
});
