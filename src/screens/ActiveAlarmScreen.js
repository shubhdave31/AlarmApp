import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
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
    const [progress, setProgress] = useState(0);
    const cameraRef = useRef(null);
    const progressInterval = useRef(null);
    const detectionLoop = useRef(null);
    const isDetecting = useRef(false); // Semaphore to prevent overlapping detections

    const isQRMode = alarmMetadata?.dismissMode === 'qr';
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

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
            stopProgress();
        };
    }, [permission, isQRMode]);

    const handleBarcodeScanned = ({ type, data }) => {
        if (scanned || !isQRMode) return;

        // For now, accept any QR code to dismiss
        setScanned(true);
        onAlarmDismissed();
    };

    const startDetectionLoop = () => {
        detectionLoop.current = setInterval(async () => {
            if (isDetecting.current || !cameraRef.current || !isMounted.current) return;

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

                    if (isMounted.current) {
                        if (result.faces.length > 0) {
                            setFaceDetected(true);
                            // Start progress if not already started
                            if (!progressInterval.current) {
                                startProgress();
                            }
                        } else {
                            setFaceDetected(false);
                            stopProgress();
                        }
                    }
                }
            } catch (error) {
                console.log("Detection error:", error);
            } finally {
                isDetecting.current = false;
            }
        }, 800); // Check every 800ms to balance performance
    };

    const stopDetectionLoop = () => {
        if (detectionLoop.current) {
            clearInterval(detectionLoop.current);
            detectionLoop.current = null;
        }
    };

    const startProgress = () => {
        if (progressInterval.current) return;

        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 5;
                if (next >= 100) {
                    clearInterval(progressInterval.current);
                    progressInterval.current = null;
                    onAlarmDismissed();
                    return 100;
                }
                return next;
            });
        }, 100); // Fills in ~2 seconds
    };

    const stopProgress = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
        if (isMounted.current) {
            setProgress(0);
        }
    };

    const onAlarmDismissed = () => {
        // Wrap in setTimeout to avoid 'Cannot update during render' issues
        // if this was triggered deeply in the react tree or by an effect
        setTimeout(() => {
            stopAlarm();
            Alert.alert("Alarm Dismissed", "Good morning!");
        }, 0);
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

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={isQRMode ? "back" : "front"}
                onBarcodeScanned={isQRMode ? handleBarcodeScanned : undefined}
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
            >
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
                                    {faceDetected && <View style={styles.scanLine} />}
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
                        {/* Only show progress bar for Face Mode */}
                        {!isQRMode && faceDetected && (
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, { width: `${progress}%` }]} />
                            </View>
                        )}
                        <TouchableOpacity onPress={stopAlarm} style={styles.testButton}>
                            <Text style={styles.testButtonText}>Emergency Stop (Dev)</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </CameraView>
        </View >
    );
}

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
        justifyContent: 'center',
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
        opacity: 0.7,
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
