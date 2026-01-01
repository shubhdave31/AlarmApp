import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

// NOTE: 'expo-camera' v17 exports 'CameraView' as the main component.
// 'expo-face-detector' is NOT compatible with CameraView.
// We have pivoted to "Barcode Mission" which is natively supported and robust.

export default function AlarmTrigger({ onDismiss }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned) return;
        setScanned(true);
        // In a real app, we would match 'data' against a saved product (e.g. toothpaste).
        // For MVP, ANY barcode dismisses it.
        Alert.alert("Success", "Barcode Scanned! You are awake.", [
            { text: "Dismiss", onPress: onDismiss }
        ]);
    };

    if (!permission) {
        return <View style={styles.container}><Text style={styles.text}>Requesting permissions...</Text></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No access to camera</Text>
                <TouchableOpacity style={styles.btn} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13", "ean8", "upc_a"],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <Text style={styles.alarmText}>WAKE UP!</Text>
                        <Text style={styles.instructionText}>
                            SCAN A BARCODE
                        </Text>
                        <Text style={styles.subText}>
                            (Toothpaste, Shampoo, etc)
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.emergencyBtn} onPress={onDismiss}>
                            <Text style={styles.emergencyText}>Emergency Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    text: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
        marginTop: 50,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'space-between',
        padding: 20,
    },
    header: {
        marginTop: 80,
        alignItems: 'center',
    },
    alarmText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FF3B30',
        letterSpacing: 2,
        textShadowColor: 'black',
        textShadowRadius: 10,
    },
    instructionText: {
        fontSize: 32,
        color: '#FFF',
        marginTop: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    subText: {
        fontSize: 18,
        color: '#DDD',
        marginTop: 10,
        fontWeight: '500',
    },
    footer: {
        marginBottom: 50,
        alignItems: 'center',
    },
    btn: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    emergencyBtn: {
        padding: 10,
    },
    emergencyText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    }
});
