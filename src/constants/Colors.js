const tintColor = '#FF9F0A'; // Classic iOS/Samsung Warm Amber

export default {
    light: {
        text: '#000000',
        textSecondary: '#8E8E93',
        background: '#F2F2F7',
        surface: '#FFFFFF',
        tint: tintColor,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColor,
        inputBackground: '#E5E5EA',
    },
    dark: {
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        background: '#000000', // Pure OLED Black
        surface: '#1C1C1E', // Dark Gray Surface
        tint: tintColor,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColor,
        inputBackground: '#2C2C2E',
    },
};
