import { Stack } from 'expo-router';
import { AlarmProvider } from '@/context/AlarmContext';

export default function Layout() {
  return (
    <AlarmProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Alarms' }} />
        <Stack.Screen
          name="add-alarm"
          options={{ presentation: 'modal', title: 'Add Alarm' }}
        />
      </Stack>
    </AlarmProvider>
  );
}
