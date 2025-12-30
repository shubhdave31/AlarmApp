const tintColor = '#00F0FF'; // Neon Cyan

export default {
    light: {
        text: '#FFFFFF',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        background: '#0F0C29', // Fallback
        gradient: ['#0F0C29', '#302B63', '#24243E'], // Midnight Purple gradient
        surface: 'rgba(255, 255, 255, 0.1)', // Glass effect
        tint: tintColor,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColor,
        inputBackground: 'rgba(0, 0, 0, 0.3)',
    },
    dark: {
        text: '#FFFFFF',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        background: '#0F0C29',
        gradient: ['#0F0C29', '#302B63', '#24243E'],
        surface: 'rgba(255, 255, 255, 0.1)',
        tint: tintColor,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColor,
        inputBackground: 'rgba(0, 0, 0, 0.3)',
    },
};
