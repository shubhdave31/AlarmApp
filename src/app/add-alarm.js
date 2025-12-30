import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlarm } from '@/context/AlarmContext';
import { GlobalStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';

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
        <LinearGradient
            colors={Colors.dark.gradient}
            style={GlobalStyles.container}
        >
            <View style={GlobalStyles.contentContainer}>
                <Text style={GlobalStyles.title}>New Alarm</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>LABEL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Work, Gym"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={label}
                        onChangeText={setLabel}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>TIME</Text>
                    <View style={styles.pickerContainer}>
                        {Platform.OS === 'android' && (
                            <TouchableOpacity onPress={() => setShowPicker(true)}>
                                <Text style={styles.timeText}>
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
                                    padding: '12px',
                                    fontSize: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'white',
                                    color: 'black',
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

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Save Alarm</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: Colors.dark.textSecondary,
        fontWeight: '500',
    },
    input: {
        backgroundColor: Colors.dark.inputBackground,
        color: Colors.dark.text,
        padding: 16,
        borderRadius: 12,
        fontSize: 18,
    },
    pickerContainer: {
        alignItems: 'center',
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: 12,
        padding: 16,
    },
    saveBtn: {
        backgroundColor: Colors.dark.tint,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: Colors.dark.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelBtn: {
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelBtnText: {
        color: Colors.dark.textSecondary,
        fontSize: 16,
    },
    timeText: {
        fontSize: 32,
        color: Colors.dark.text,
        fontWeight: 'bold',
    },
});
