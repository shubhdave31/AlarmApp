import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useAlarm } from '@/context/AlarmContext';
import { GlobalStyles } from '@/constants/Styles';

export default function AddAlarm() {
    const [date, setDate] = useState(new Date());
    const [label, setLabel] = useState('');
    const { addAlarm } = useAlarm();
    const router = useRouter();

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
    };

    const handleSave = () => {
        addAlarm(date.toISOString(), label || 'Alarm');
        router.back();
    };

    return (
        <View style={GlobalStyles.container}>
            <Text style={GlobalStyles.title}>New Alarm</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Label</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Work, Gym"
                    value={label}
                    onChangeText={setLabel}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Time</Text>
                <View style={styles.pickerContainer}>
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="time"
                        is24Hour={true}
                        onChange={onChange}
                        display="default"
                    />
                </View>
            </View>

            <Button title="Save Alarm" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    pickerContainer: {
        alignItems: 'flex-start',
    },
});
