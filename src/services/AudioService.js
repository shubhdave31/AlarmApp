import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Alert } from 'react-native';

// Global Singleton (Module Level Variable)
// This survives React re-renders and component unmounts
let globalSound = null;
let isPlaying = false;

export const playAlarmSound = async () => {
    // 1. Safety Check: If already playing, stop first (or ignore)
    if (isPlaying && globalSound) {
        console.log("[AudioService] Sound already playing. Ignoring start request.");
        return;
    }

    try {
        console.log("[AudioService] Starting Audio...");

        // 2. Configure Audio Session (Important for Background/Silent Mode)
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
        });

        // 3. Unload any existing sound (Just in case)
        if (globalSound) {
            await globalSound.unloadAsync();
            globalSound = null;
        }

        // 4. Create and Play
        const { sound } = await Audio.Sound.createAsync(
            { uri: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
            { shouldPlay: true, isLooping: true, volume: 1.0 }
        );

        globalSound = sound;
        isPlaying = true;

        // Ensure we catch "playback finished" to reset state if looping fails or ends
        globalSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish && !status.isLooping) {
                isPlaying = false;
            }
        });

    } catch (error) {
        console.error("[AudioService] Playback Failed:", error);
        isPlaying = false;
        Alert.alert("Error", "Could not play alarm sound.");
    }
};

export const stopAlarmSound = async () => {
    try {
        console.log("[AudioService] Stopping Audio...");
        if (globalSound) {
            // Check status first to avoid errors
            const status = await globalSound.getStatusAsync();
            if (status.isLoaded) {
                await globalSound.stopAsync();
                await globalSound.unloadAsync();
            }
        }
    } catch (error) {
        console.warn("[AudioService] Error stopping sound:", error);
    } finally {
        globalSound = null;
        isPlaying = false;
    }
};
