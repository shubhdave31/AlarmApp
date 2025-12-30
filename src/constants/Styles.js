import { StyleSheet } from 'react-native';
import Colors from './Colors';

export const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

export const Theme = Colors;
