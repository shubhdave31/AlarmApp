import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlarm } from '@/context/AlarmContext';
import AlarmCard from '@/components/AlarmCard';
import { GlobalStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';

export default function Home() {
    const { alarms } = useAlarm();
    const router = useRouter();

    return (
        <LinearGradient
            colors={Colors.dark.gradient}
            style={GlobalStyles.container}
        >
            <FlatList
                data={alarms}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
                renderItem={({ item }) => <AlarmCard alarm={item} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No Alarms</Text>
                        <Text style={styles.emptySubText}>Add one to get started</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-alarm')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 24,
        color: Colors.dark.textSecondary,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 32,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.dark.tint,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.dark.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        lineHeight: 34,
        fontWeight: 'bold',
    },
});
