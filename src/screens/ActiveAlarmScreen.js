import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlarm } from '../context/AlarmContext';

const { width, height } = Dimensions.get('window');

export default function ActiveAlarmScreen() {
    const { stopAlarm, alarmMetadata } = useAlarm();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const faceDetectedRef = useRef(false); // Mirror state for Loop Closure

    // UI Animations (No State Re-renders)
    const progressAnim = useRef(new Animated.Value(0)).current;
    const scanLineAnim = useRef(new Animated.Value(0)).current;

    const cameraRef = useRef(null);
    const detectionLoop = useRef(null);
    const isDetecting = useRef(false);
    const isMounted = useRef(true);

    const dismissed = useRef(false);

    const isQRMode = alarmMetadata?.dismissMode === 'qr';

    useEffect(() => {
        isMounted.current = true;
        startScanLineAnimation();

        // Add Listener for 100% completion
        const id = progressAnim.addListener(({ value }) => {
            if (value >= 100 && !dismissed.current) {
                dismissed.current = true;
                console.log("Progress 100%. Dismissing...");
                onAlarmDismissed();
            }
        });

        return () => {
            isMounted.current = false;
            progressAnim.removeListener(id);
        };
    }, []);

    const startScanLineAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    useEffect(() => {
        // Start detection loop when permission granted AND in face mode
        if (permission?.granted && !isQRMode) {
            startDetectionLoop();
        }
        return () => {
            stopDetectionLoop();
            // Do not reset progress here immediately to avoid flickering logic
        };
    }, [permission, isQRMode]);

    const onAlarmDismissed = React.useCallback(() => {
        stopAlarm();
        // Delay Alert slightly to allow UI to close
        setTimeout(() => {
            Alert.alert("Alarm Dismissed", "Good morning!");
        }, 300);
    }, [stopAlarm]);

    const handleBarcodeScanned = React.useCallback(({ type, data }) => {
        if (scanned || !isQRMode) return;

        // For now, accept any QR code to dismiss
        setScanned(true);
        onAlarmDismissed();
    }, [scanned, isQRMode, onAlarmDismissed]);

    const startDetectionLoop = () => {
        if (detectionLoop.current) clearInterval(detectionLoop.current);

        detectionLoop.current = setInterval(async () => {
            // Prevent overlap and ensure mounted
            if (isDetecting.current || !cameraRef.current || !isMounted.current || dismissed.current) return;

            try {
                isDetecting.current = true;
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.1,
                    skipProcessing: true,
                    shutterSound: false
                });

                if (photo?.uri && isMounted.current) {
                    const result = await FaceDetector.detectFacesAsync(photo.uri, {
                        mode: FaceDetector.FaceDetectorMode.fast,
                        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                        runClassifications: FaceDetector.FaceDetectorClassifications.none,
                        minDetectionInterval: 100,
                        tracking: false
                    });

                    if (isMounted.current && !dismissed.current) {
                        if (result.faces.length > 0) {
                            if (!faceDetectedRef.current) {
                                setFaceDetected(true);
                                faceDetectedRef.current = true;
                                startProgress();
                            }
                        } else {
                            if (faceDetectedRef.current) {
                                setFaceDetected(false);
                                faceDetectedRef.current = false;
                                stopProgress();
                            }
                        }
                    }
                }
            } catch (error) {
                console.log("Detection error:", error);
            } finally {
                isDetecting.current = false;
            }
        }, 1000); // CHECK EVERY 1s to reduce flashing annoyance
    };

    const stopDetectionLoop = () => {
        if (detectionLoop.current) {
            clearInterval(detectionLoop.current);
            detectionLoop.current = null;
        }
    };

    const startProgress = () => {
        if (dismissed.current) return;

        // Build up to 100% over 2 seconds (Faster feel)
        Animated.timing(progressAnim, {
            toValue: 100,
            duration: 2500, // 2.5 seconds to open
            easing: Easing.linear,
            useNativeDriver: false, // width property
        }).start();
    };

    const stopProgress = () => {
        if (dismissed.current) return;

        progressAnim.stopAnimation();
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    if (!permission) {
        return <View style={styles.container} />; // Loading
    }
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No access to camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.emergencyButton}>
                    <Text style={styles.emergencyText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={stopAlarm} style={styles.emergencyButton}>
                    <Text style={styles.emergencyText}>Emergency Dismiss</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const scanLineTranslateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 240], // Height of faceBox - roughly
    });

    return (
        <View style={styles.container}>
            <MemoizedCamera
                cameraRef={cameraRef}
                isQRMode={isQRMode}
                onBarcodeScanned={isQRMode ? handleBarcodeScanned : undefined}
            />
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                style={styles.overlay}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>ALARM ACTIVE</Text>
                    <Text style={styles.subtitle}>
                        {alarmMetadata?.label || "Wake Up!"}
                    </Text>
                </View>

                <View style={styles.centerRegion}>
                    {!isQRMode ? (
                        // FACE MODE UI
                        <>
                            <View style={[styles.faceBox, faceDetected && styles.faceBoxActive]}>
                                <Animated.View style={[
                                    styles.scanLine,
                                    { transform: [{ translateY: scanLineTranslateY }] }
                                ]} />
                            </View>
                            <Text style={styles.instructionText}>
                                {faceDetected ? "Hold still..." : "Scan Face to Stop"}
                            </Text>
                        </>
                    ) : (
                        // QR MODE UI
                        <>
                            <View style={[styles.qrBox, scanned && styles.qrBoxActive]} />
                            <Text style={styles.instructionText}>
                                {scanned ? "Scanned!" : "Scan ANY QR Code"}
                            </Text>
                        </>
                    )}
                </View>

                <View style={styles.footer}>
                    {!isQRMode && (
                        <View style={styles.progressBarContainer}>
                            <Animated.View style={[
                                styles.progressBar,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]} />
                        </View>
                    )}
                    <TouchableOpacity onPress={stopAlarm} style={styles.testButton}>
                        <Text style={styles.testButtonText}>Emergency Stop (Animations)</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View >
    );
}

// Extract Camera to prevent re-renders when progress/overlay state changes
const MemoizedCamera = React.memo(({ cameraRef, isQRMode, onBarcodeScanned }) => (
    <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={isQRMode ? "back" : "front"}
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{
            barcodeTypes: [
                "qr",
                "ean13",
                "ean8",
                "pdf417",
                "aztec",
                "datamatrix",
                "code39",
                "code93",
                "itf14",
                "codabar",
                "code128",
                "upc_e",
                "upc_a"
            ],
        }}
    />
));

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 60,
    },
    header: {
        alignItems: 'center',
    },
    title: {
        color: '#FF3B30',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
    },
    subtitle: {
        color: '#FFF',
        fontSize: 18,
        marginTop: 10,
        opacity: 0.8,
    },
    centerRegion: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    faceBox: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 20,
        justifyContent: 'flex-start', // Important for scan line
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    faceBoxActive: {
        borderColor: '#34C759',
        borderWidth: 4,
    },
    scanLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#34C759',
        opacity: 0.8,
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    instructionText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    qrBox: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    qrBoxActive: {
        borderColor: '#34C759',
        backgroundColor: 'rgba(52, 199, 89, 0.2)',
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#34C759',
    },
    text: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    emergencyButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        alignSelf: 'center',
    },
    emergencyText: {
        color: 'white',
        fontWeight: 'bold',
    },
    testButton: {
        padding: 10,
    },
    testButtonText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
});
