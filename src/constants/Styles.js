import { StyleSheet } from 'react-native';
import Colors from './Colors';

export const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0, // Reset padding because Gradient will handle layout
        backgroundColor: Colors.dark.background,
    },
    contentContainer: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 40,
        fontWeight: '100',
        letterSpacing: -1,
        marginBottom: 32,
        color: Colors.dark.text,
        marginTop: 60,
    },
});

export const Theme = Colors;
