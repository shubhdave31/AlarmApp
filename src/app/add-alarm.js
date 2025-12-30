import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, TouchableOpacity, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useAlarm } from '@/context/AlarmContext';
import { GlobalStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import ScreenBackground from '@/components/ScreenBackground';

const { width } = Dimensions.get('window');

export default function AddAlarm() {
    const [date, setDate] = useState(new Date());
    const [label, setLabel] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const { addAlarm } = useAlarm();
    const router = useRouter();

    const onChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        const currentDate = selectedDate || date;
        setDate(currentDate);
    };

    const handleSave = () => {
        addAlarm(date.toISOString(), label || 'Alarm');
        router.back();
    };

    return (
        <ScreenBackground>
            <View style={GlobalStyles.contentContainer}>
                <Text style={styles.headerTitle}>New Alarm</Text>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>LABEL</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Morning Workout"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={label}
                            onChangeText={setLabel}
                            selectionColor={Colors.dark.tint}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>TIME</Text>
                        <View style={styles.timeContainer}>
                            {Platform.OS === 'android' && (
                                <TouchableOpacity onPress={() => setShowPicker(true)}>
                                    <Text style={styles.timeDisplay}>
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {Platform.OS === 'web' ? (
                                React.createElement('input', {
                                    type: 'time',
                                    value: date.toTimeString().slice(0, 5),
                                    onChange: (e) => {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(date);
                                        newDate.setHours(hours);
                                        newDate.setMinutes(minutes);
                                        onChange(null, newDate);
                                    },
                                    style: {
                                        width: '100%',
                                        padding: '10px',
                                        fontSize: '18px',
                                        fontFamily: 'Inter',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#2C2C2E',
                                        color: Colors.dark.tint,
                                        outline: 'none',
                                        textAlign: 'right'
                                    }
                                })
                            ) : (
                                (showPicker || Platform.OS !== 'android') && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        mode="time"
                                        is24Hour={true}
                                        onChange={onChange}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        textColor="white"
                                    />
                                )
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                        <Text style={styles.saveBtnText}>Create Alarm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    headerTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 32,
        color: '#fff',
        marginTop: 40,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    formContainer: {
        backgroundColor: '#1C1C1E', // Dark Gray Surface
        borderRadius: 16,
        padding: 0, // List style
        marginBottom: 32,
        overflow: 'hidden',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E', // Separator
        minHeight: 60,
    },
    label: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: '#fff',
        flex: 1,
    },
    input: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: Colors.dark.tint,
        textAlign: 'right',
        flex: 2,
        padding: 0,
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    timeDisplay: {
        fontFamily: 'Inter_400Regular',
        fontSize: 18,
        color: Colors.dark.tint,
        backgroundColor: 'rgba(255,159,10, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        overflow: 'hidden',
    },
    actionContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    saveBtn: {
        backgroundColor: Colors.dark.tint,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveBtnText: {
        fontFamily: 'Inter_600SemiBold',
        color: '#000',
        fontSize: 17,
    },
    cancelBtn: {
        padding: 16,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: 'Inter_400Regular',
        color: Colors.dark.tint,
        fontSize: 17,
    },
});
