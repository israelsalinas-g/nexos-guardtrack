import React, { useRef, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Zap, ZapOff, Camera, CheckCircle, ArrowRight } from 'lucide-react-native';

type Phase = 'scanning' | 'confirm' | 'capture';

interface ScannerScreenProps {
  onScan: (token: string, photoUri?: string) => void;
  onClose: () => void;
}

export default function ScannerScreen({ onScan, onClose }: ScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('scanning');
  const [torch, setTorch] = useState(false);
  const [scannedToken, setScannedToken] = useState('');
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Necesitamos permiso para usar la cámara
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Dar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (phase !== 'scanning') return;
    setScannedToken(data);
    setPhase('confirm');
  };

  const handleTakePhoto = () => setPhase('capture');

  const handleSkipPhoto = () => onScan(scannedToken, undefined);

  const handleCapturePhoto = async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });
      onScan(scannedToken, photo?.uri);
    } catch {
      // On camera failure, deliver scan without photo rather than blocking the guard
      onScan(scannedToken, undefined);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={phase === 'scanning' ? handleBarCodeScanned : undefined}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        {/* ── Shared header ─────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
          {phase === 'scanning' && (
            <TouchableOpacity onPress={() => setTorch(t => !t)} style={styles.iconBtn}>
              {torch
                ? <Zap color="#38bdf8" size={24} />
                : <ZapOff color="#fff" size={24} />}
            </TouchableOpacity>
          )}
        </View>

        {/* ── Phase: scanning ───────────────────────── */}
        {phase === 'scanning' && (
          <View style={styles.scanCenter}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.hint}>Encuadra el código QR en el centro</Text>
          </View>
        )}

        {/* ── Phase: confirm ────────────────────────── */}
        {phase === 'confirm' && (
          <View style={styles.confirmPanel}>
            <View style={styles.confirmBadge}>
              <CheckCircle color="#10b981" size={32} />
              <Text style={styles.confirmTitle}>QR Detectado</Text>
              <Text style={styles.confirmSub}>¿Deseas adjuntar foto de evidencia?</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleTakePhoto}>
              <Camera color="#020617" size={20} />
              <Text style={styles.primaryBtnText}>Tomar Foto Evidencia</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={handleSkipPhoto}>
              <ArrowRight color="#94a3b8" size={18} />
              <Text style={styles.ghostBtnText}>Continuar sin Foto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Phase: capture ────────────────────────── */}
        {phase === 'capture' && (
          <View style={styles.capturePanel}>
            <Text style={styles.captureHint}>Captura evidencia del punto de control</Text>
            <TouchableOpacity
              style={[styles.shutter, capturing && styles.shutterDisabled]}
              onPress={handleCapturePhoto}
              disabled={capturing}
            >
              {capturing
                ? <ActivityIndicator color="#020617" />
                : <View style={styles.shutterInner} />}
            </TouchableOpacity>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  iconBtn: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 50,
  },
  // ── scanning phase
  scanCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#38bdf8',
    borderWidth: 4,
  },
  topLeft:     { top: 0,    left: 0,  borderRightWidth: 0, borderBottomWidth: 0 },
  topRight:    { top: 0,    right: 0, borderLeftWidth: 0,  borderBottomWidth: 0 },
  bottomLeft:  { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0,  borderTopWidth: 0 },
  hint: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  // ── confirm phase
  confirmPanel: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 52,
    gap: 14,
  },
  confirmBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20,
    padding: 24,
    gap: 8,
    marginBottom: 6,
  },
  confirmTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmSub: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#38bdf8',
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryBtnText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  ghostBtnText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  // ── capture phase
  capturePanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 60,
    gap: 28,
  },
  captureHint: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  shutterDisabled: {
    opacity: 0.6,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  // ── permission screen
  permissionText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 32,
    fontSize: 15,
  },
  permBtn: {
    backgroundColor: '#38bdf8',
    padding: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  permBtnText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
