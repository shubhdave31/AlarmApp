import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlarm } from '@/context/AlarmContext';
import AlarmCard from '@/components/AlarmCard';
import { GlobalStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';

export default function Home() {
    const { alarms } = useAlarm();
    const router = useRouter();

    return (
        <View style={GlobalStyles.container}>
            <FlatList
                data={alarms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AlarmCard alarm={item} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No alarms set.</Text>
                        <Text style={styles.emptySubText}>Tap + to add one.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-alarm')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 20,
        color: '#888',
    },
    emptySubText: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.light.tint,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        lineHeight: 32,
    },
});
