import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity,
  Image, Alert, Animated,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import MoodWheel, { MOODS } from '../mood/MoodWheel';
import api from '../../services/core/api';
import { journalFormStyles as s, J } from '../../styles/journal/journal.styles';
import { uploadLogMedia, type LogMediaUploadInput } from '../../services/journal/log-media.service';
import { ensurePinSetup } from '../../services/auth/ensure-pin-setup';
import { MicLineIcon } from '../shared/AppIcons';

export interface AudioItem extends LogMediaUploadInput {
  id?:   string;
  label: string;
}

export interface PhotoItem extends LogMediaUploadInput {
  id?:      string;
  uploaded: boolean;
}

export interface JournalFormData {
  mood:   typeof MOODS[0] | null;
  note:   string;
  photos: PhotoItem[];
  audios: AudioItem[];
}

interface Props {
  logId?:         string;
  pinSetupReturnTo?: string;
  initialMood?:   typeof MOODS[0] | null;
  initialNote?:   string;
  initialPhotos?: PhotoItem[];
  initialAudios?: AudioItem[];
  onChange?:      (data: JournalFormData) => void;
}

export default function JournalEntryForm({
  logId,
  pinSetupReturnTo,
  initialMood   = null,
  initialNote   = '',
  initialPhotos = [],
  initialAudios = [],
  onChange,
}: Props) {
  const [showWheel,    setShowWheel]    = useState(false);
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(initialMood);
  const [note,         setNote]         = useState(initialNote);
  const [photos,       setPhotos]       = useState<PhotoItem[]>(initialPhotos);
  const [audios,       setAudios]       = useState<AudioItem[]>(initialAudios);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [recording,   setRecording]   = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const recordingBusyRef = useRef(false);
  const recordAnim = useRef(new Animated.Value(1)).current;
  const recordPulseStyle = useMemo(() => ({ transform: [{ scale: recordAnim }] }), [recordAnim]);

  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => { if (initialMood)            setSelectedMood(initialMood);     }, [initialMood?.name]);
  useEffect(() => { if (initialNote)            setNote(initialNote);             }, [initialNote]);
  useEffect(() => { if (initialPhotos.length)   setPhotos(initialPhotos);         }, [initialPhotos.length]);
  useEffect(() => { if (initialAudios.length)   setAudios(initialAudios);         }, [initialAudios.length]);

  useEffect(() => {
    onChange?.({ mood: selectedMood, note, photos, audios });
  }, [selectedMood, note, photos, audios]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordAnim, { toValue: 1.18, duration: 600, useNativeDriver: true }),
          Animated.timing(recordAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      recordAnim.stopAnimation();
      recordAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const pickImage = async () => {
    if (uploadingPhoto) return;
    if (!(await ensurePinSetup(pinSetupReturnTo))) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (result.canceled) return;

      const slots = 9 - photos.length;
      if (slots <= 0) return;

      const picked: PhotoItem[] = result.assets.slice(0, slots).map((asset) => ({
        uri: asset.uri,
        uploaded: false,
        file: asset.file,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      }));

      if (logId) {
        setUploadingPhoto(true);
        const uploaded: PhotoItem[] = [];
        let failed = 0;

        for (const photo of picked) {
          const res = await uploadLogMedia(logId, photo, 'photo');
          if (!res) failed += 1;
          uploaded.push(res
            ? { ...photo, id: res.id, uploaded: true }
            : photo
          );
        }

        setPhotos(prev => [...prev, ...uploaded]);
        if (failed > 0) {
          Alert.alert(
            'Một số ảnh chưa upload được',
            'Ảnh đã được giữ lại trên màn hình. Bấm lưu lần nữa để thử upload lại.'
          );
        }
      } else {
        setPhotos(prev => [...prev, ...picked]);
      }
    } catch (error) {
      console.warn('pickImage error:', error);
      Alert.alert('Lỗi', 'Không thể thêm ảnh lúc này. Vui lòng thử lại.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = async (idx: number) => {
    const photo = photos[idx];
    if (photo.id && logId) {
      try {
        await api.delete(`/logs/${logId}/photo/${photo.id}`);
      } catch {}
    }
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const startRecording = async () => {
    if (recordingBusyRef.current || recording) return;
    if (!(await ensurePinSetup(pinSetupReturnTo))) return;
    recordingBusyRef.current = true;
    setRecordingBusy(true);
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền microphone', 'Vui lòng cấp quyền truy cập microphone.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRec);
      setIsRecording(true);
    } catch {
      Alert.alert('Lỗi', 'Không thể bắt đầu thu âm.');
    } finally {
      recordingBusyRef.current = false;
      setRecordingBusy(false);
    }
  };

  const stopRecording = async () => {
    if (!recording || recordingBusyRef.current) return;
    const currentRecording = recording;
    recordingBusyRef.current = true;
    setRecordingBusy(true);
    setRecording(null);
    setIsRecording(false);
    try {
      try {
        await currentRecording.stopAndUnloadAsync();
      } catch (error: any) {
        const message = String(error?.message ?? error);
        if (!message.includes('already been unloaded')) {
          throw error;
        }
      }

      const uri = currentRecording.getURI();
      if (!uri) return;

      if (logId) {
        const res = await uploadLogMedia(logId, { uri }, 'audio');
        if (res) {
          setAudios(prev => [...prev, { id: res.id, uri, label: res.label ?? `Ghi âm ${prev.length + 1}` }]);
          return;
        }
      }
      setAudios(prev => [...prev, { uri, label: `Ghi âm ${prev.length + 1}` }]);
    } catch (e) {
      console.warn('Stop recording error:', e);
    } finally {
      recordingBusyRef.current = false;
      setRecordingBusy(false);
    }
  };

  const removeAudio = async (idx: number) => {
    const audio = audios[idx];
    if (playingIdx === idx) {
      await soundRef.current?.stopAsync();
      setPlayingIdx(null);
    }
    if (audio.id && logId) {
      try { await api.delete(`/logs/${logId}/audio/${audio.id}`); } catch {}
    }
    setAudios(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((a, i) => ({ ...a, label: `Ghi âm ${i + 1}` }));
    });
  };

  const togglePlay = async (idx: number) => {
    if (playingIdx === idx) {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
      setPlayingIdx(null);
      return;
    }
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: audios[idx].uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlayingIdx(idx);
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingIdx(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch {
      setPlayingIdx(null);
      Alert.alert('Lỗi', 'Không thể phát file âm thanh.');
    }
  };

  return (
    <View style={s.container}>

      <TouchableOpacity
        style={[s.card, s.moodCard, selectedMood && { backgroundColor: selectedMood.color + '22' }]}
        onPress={() => setShowWheel(true)}
        activeOpacity={0.8}
      >
        {selectedMood ? (
          <View style={s.moodRow}>
            <Text style={s.moodEmoji}>{selectedMood.emoji}</Text>
            <View style={s.moodTextWrap}>
              <Text style={s.moodName}>{selectedMood.name}</Text>
              <Text style={s.moodDesc}>{selectedMood.desc}</Text>
            </View>
            <Text style={s.moodChange}>Đổi ›</Text>
          </View>
        ) : (
          <View style={s.moodRow}>
            <Text style={s.moodEmoji}></Text>
            <View style={s.moodTextWrap}>
              <Text style={s.moodName}>Tâm trạng hôm nay</Text>
              <Text style={s.moodDesc}>Nhấn để chọn qua mood wheel</Text>
            </View>
            <Text style={s.moodChevron}>›</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={s.card}>
        <Text style={s.cardTitle}>Viết về ngày hôm nay</Text>
        <TextInput
          style={s.textInput}
          placeholder="Nhập những gì bạn đang nghĩ..."
          placeholderTextColor={J.placeholder}
          multiline
          value={note}
          onChangeText={setNote}
          textAlignVertical="top"
        />
        {note.length > 0 && (
          <Text style={s.charCount}>{note.length} ký tự</Text>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Ảnh của bạn</Text>
        <View style={s.photosGrid}>
          {photos.map((photo, i) => (
            <View key={i} style={s.photoWrap}>
              <Image source={{ uri: photo.uri }} style={s.photo} />
              <TouchableOpacity style={s.photoRemove} onPress={() => removePhoto(i)}>
                <Text style={s.photoRemoveText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 9 && (
            <TouchableOpacity style={s.photoAdd} onPress={pickImage} disabled={uploadingPhoto}>
              {uploadingPhoto
                ? <ActivityIndicator color={J.accent} />
                : <>
                    <Text style={s.photoAddIcon}>+</Text>
                    <Text style={s.photoAddLabel}>Thêm ảnh</Text>
                  </>
              }
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Ghi âm</Text>

        {audios.length > 0 && (
          <View style={s.audioList}>
            {audios.map((audio, i) => (
              <View key={i} style={s.audioRow}>
                <TouchableOpacity style={s.audioPlayBtn} onPress={() => togglePlay(i)}>
                  <Text style={s.audioPlayIcon}>{playingIdx === i ? '⏹' : '▶'}</Text>
                </TouchableOpacity>
                <Text style={s.audioLabel}>{audio.label}</Text>
                <TouchableOpacity style={s.audioDeleteBtn} onPress={() => removeAudio(i)}>
                  <Text style={s.audioDeleteIcon}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={s.voiceWrap}>
          <Animated.View style={recordPulseStyle}>
            <TouchableOpacity
              style={[s.micBtn, isRecording && s.micBtnActive]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={recordingBusy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isRecording ? 'Dừng thu âm' : 'Bắt đầu thu âm'}
            >
              <MicLineIcon size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
          <Text style={[s.voiceHint, isRecording && s.voiceHintActive]}>
            {isRecording
              ? '● Đang thu âm… nhấn để dừng'
              : audios.length > 0
                ? `Nhấn để thêm ghi âm ${audios.length + 1}`
                : 'Nhấn để bắt đầu thu âm'}
          </Text>
        </View>
      </View>

      {showWheel && (
        <MoodWheel
          onConfirm={mood => { setSelectedMood(mood); setShowWheel(false); }}
          onClose={() => setShowWheel(false)}
        />
      )}
    </View>
  );
}
