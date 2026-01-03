import { Stack } from 'expo-router';
import { AlarmProvider, useAlarm } from '@/context/AlarmContext';
import ActiveAlarmScreen from '@/screens/ActiveAlarmScreen';
import { useFonts, Inter_200ExtraLight, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AlarmProvider>
      <AlarmMonitor />
    </AlarmProvider>
  );
}

function AlarmMonitor() {
  const { isAlarmRinging } = useAlarm();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {isAlarmRinging && <ActiveAlarmScreen />}
    </>
  );
}
