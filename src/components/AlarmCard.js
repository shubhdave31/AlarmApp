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
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    info: {
        flex: 1,
    },
    time: {
        fontSize: 32,
        fontWeight: '300',
        color: '#000',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    actions: {
        alignItems: 'flex-end',
        gap: 8,
    },
    deleteBtn: {
        marginTop: 4,
    },
    deleteText: {
        color: 'red',
        fontSize: 12,
    },
});
