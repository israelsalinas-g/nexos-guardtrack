import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ArrowLeft, Camera, RotateCcw, Send, AlertTriangle, X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { File, Directory, Paths } from 'expo-file-system';
import { addToQueue } from '@/lib/queue';
import { useRound } from '@/hooks/useRound';

const MIN_DESC_LENGTH = 10;

export default function IncidentReportScreen() {
  const navigation = useNavigation();
  const { activeRound } = useRound();
  const [permission, requestPermission] = useCameraPermissions();

  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  /* ── Camera ──────────────────────────────────────────── */

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setCameraOpen(true);
  };

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setCameraOpen(false);
      }
    } catch {
      Alert.alert('Error', 'No se pudo capturar la foto.');
    } finally {
      setCapturing(false);
    }
  };

  /* ── Submit ──────────────────────────────────────────── */

  const handleSubmit = async () => {
    const desc = description.trim();
    if (desc.length < MIN_DESC_LENGTH) {
      Alert.alert('Descripción muy corta', `Describe el incidente con al menos ${MIN_DESC_LENGTH} caracteres.`);
      return;
    }

    setSubmitting(true);
    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      const incidentId = Crypto.randomUUID();
      const now = Date.now();

      // Persist photo to permanent storage
      let localPhotoPath: string | null = null;
      if (photoUri) {
        try {
          const dir = new Directory(Paths.document, 'incidents');
          if (!dir.exists) dir.create({ intermediates: true });
          const destFile = new File(Paths.document, 'incidents', `${incidentId}.jpg`);
          new File(photoUri).move(destFile);
          localPhotoPath = destFile.uri;
        } catch (photoErr) {
          console.error('Incident photo save error:', photoErr);
          // Non-fatal — incident still recorded without photo
        }
      }

      await db.runAsync(
        `INSERT INTO incidentes_local
          (id, ronda_id, tipo, descripcion, foto_path, sincronizado, created_at)
         VALUES (?, ?, 'manual', ?, ?, 0, ?)`,
        [incidentId, activeRound?.id ?? null, desc, localPhotoPath, now]
      );

      await addToQueue('incidente', incidentId);

      Alert.alert(
        'Incidente registrado',
        'El reporte fue guardado y se sincronizará automáticamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Incident submit error:', err);
      Alert.alert('Error', 'No se pudo guardar el incidente. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Camera overlay ──────────────────────────────────── */

  if (cameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} />

        <SafeAreaView style={styles.cameraUi}>
          <TouchableOpacity
            style={styles.cameraClose}
            onPress={() => setCameraOpen(false)}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>

          <View style={styles.cameraBottom}>
            <Text style={styles.cameraHint}>Captura evidencia del incidente</Text>
            <TouchableOpacity
              style={[styles.shutter, capturing && styles.shutterDisabled]}
              onPress={handleCapture}
              disabled={capturing}
            >
              {capturing
                ? <ActivityIndicator color="#020617" />
                : <View style={styles.shutterInner} />}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  /* ── Form ────────────────────────────────────────────── */

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Reportar Incidente</Text>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* Active round chip */}
          {activeRound ? (
            <View style={styles.roundChip}>
              <AlertTriangle size={14} color="#f59e0b" />
              <Text style={styles.roundChipText}>Asociado a la ronda en curso</Text>
            </View>
          ) : (
            <View style={[styles.roundChip, styles.roundChipNeutral]}>
              <Text style={[styles.roundChipText, { color: '#64748b' }]}>
                Sin ronda activa — incidente general
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descripción <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe qué ocurrió, dónde y cuándo..."
              placeholderTextColor="#475569"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={[
              styles.charCount,
              description.trim().length < MIN_DESC_LENGTH && description.length > 0
                ? styles.charCountWarn : null,
            ]}>
              {description.trim().length}/{MIN_DESC_LENGTH} mín.
            </Text>
          </View>

          {/* Photo evidence */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Foto evidencia <Text style={styles.optional}>(opcional)</Text></Text>

            {photoUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => { setPhotoUri(null); openCamera(); }}
                >
                  <RotateCcw size={16} color="#94a3b8" />
                  <Text style={styles.retakeBtnText}>Retomar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.photoBtn} onPress={openCamera}>
                <Camera size={22} color="#38bdf8" />
                <Text style={styles.photoBtnText}>Agregar Foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#020617" />
              : <>
                  <Send size={18} color="#020617" />
                  <Text style={styles.submitBtnText}>Enviar Reporte</Text>
                </>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    backgroundColor: '#0f172a',
    borderRadius: 10,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

  form: {
    padding: 24,
    gap: 24,
  },

  roundChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  roundChipNeutral: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  roundChipText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '500',
  },

  fieldGroup: { gap: 8 },
  label: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  required: { color: '#f43f5e' },
  optional: { color: '#64748b', fontWeight: '400' },

  textArea: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    minHeight: 120,
  },
  charCount: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'right',
  },
  charCountWarn: { color: '#f59e0b' },

  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 18,
    borderStyle: 'dashed',
  },
  photoBtnText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
  photoPreviewContainer: { gap: 10 },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#0f172a',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 10,
  },
  retakeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#38bdf8',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* ── camera overlay ── */
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraUi: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraClose: {
    margin: 20,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  cameraBottom: {
    alignItems: 'center',
    paddingBottom: 48,
    gap: 24,
  },
  cameraHint: {
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
  shutterDisabled: { opacity: 0.6 },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
