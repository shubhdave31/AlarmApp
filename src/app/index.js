import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function Home() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Stack.Screen options={{ title: 'Home' }} />
            <Text>Welcome to AlarmApp</Text>
        </View>
    );
}
