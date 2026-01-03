import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlarm } from '@/context/AlarmContext';
import AlarmCard from '@/components/AlarmCard';
import ScreenBackground from '@/components/ScreenBackground';
import AlarmTrigger from '@/components/AlarmTrigger';
import { GlobalStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function Home() {
    const { alarms, isAlarmRinging, stopAlarm } = useAlarm();
    const router = useRouter();

    if (isAlarmRinging) {
        return (
            <AlarmTrigger
                onDismiss={stopAlarm}
            />
        );
    }

    return (
        <ScreenBackground>
            <View style={GlobalStyles.contentContainer}>
                <Text style={styles.headerTitle}>Alarms</Text>

                <FlatList
                    data={alarms}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <AlarmCard alarm={item} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No Alarms Set</Text>
                            <Text style={styles.emptySubText}>Add one to get started</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/add-alarm')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            </View>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    headerTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 34,
        color: '#fff',
        marginTop: 60,
        marginBottom: 20,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    testButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginLeft: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    testButtonText: {
        color: '#FF3B30',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 150,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 22,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 8,
    },
    emptySubText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
    },
    fab: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.dark.tint,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.dark.tint,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    fabIcon: {
        fontSize: 32,
        color: '#000',
        fontWeight: 'bold',
        marginTop: -2,
    },
});
