import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, Alert, Animated, ScrollView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import JournalEntryForm, { JournalFormData } from '../../../components/journal/JournalEntryForm';
import api from '../../../services/core/api';
import { uploadLogMedia } from '../../../services/journal/log-media.service';
import { journalHeaderStyles as h, journalToastStyles as t, journalNewStyles as s } from '../../../styles/journal/journal.styles';
import { CheckLineIcon } from '../../../components/shared/AppIcons';

export default function NewJournalScreen() {
  const [formData, setFormData] = useState<JournalFormData>({
    mood: null, note: '', photos: [], audios: [],
  });
  const [loading, setLoading]         = useState(false);
  const [createdLogId, setCreatedLogId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const canSave = !!(
    formData.mood ||
    formData.note.trim() ||
    formData.photos.length ||
    formData.audios.length
  );

  useEffect(() => {
    if (!toastVisible) return;
    toastAnim.setValue(0);
    Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }).start();
    const timer = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== 'web' })
        .start(() => { setToastVisible(false); router.replace('/tabs/journal'); });
    }, 1800);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const handleSubmit = async () => {
    if (!canSave || loading) return;
    setLoading(true);
    try {
      let logId = createdLogId;
      const payload = {
        mood:      formData.mood?.name  ?? 'neutral',
        moodScore: formData.mood?.score ?? 3,
        factors:   [],
        note:      formData.note.trim() || null,
      };

      if (logId) {
        await api.put(`/logs/${logId}`, payload);
      } else {
        const res = await api.post('/logs', payload);
        const createdLog = res.data?.log ?? res.data;
        logId = createdLog?.id ?? null;
        if (logId) setCreatedLogId(logId);
      }

      let mediaFailed = 0;
      let mediaTotal = 0;
      if (logId) {
        const photoTargets = formData.photos.filter((p) => !p.id);
        const audioTargets = formData.audios.filter((a) => !a.id);
        mediaTotal = photoTargets.length + audioTargets.length;

        const photoResults = await Promise.all(
          photoTargets.map(async (p) => ({ source: p, result: await uploadLogMedia(logId, p, 'photo') }))
        );
        const audioResults = await Promise.all(
          audioTargets.map(async (a) => ({ source: a, result: await uploadLogMedia(logId, a, 'audio') }))
        );
        const uploadedPhotos = photoResults.filter(({ result }) => result);
        const uploadedAudios = audioResults.filter(({ result }) => result);

        if (uploadedPhotos.length || uploadedAudios.length) {
          setFormData((prev) => ({
            ...prev,
            photos: prev.photos.map((photo) => {
              const uploaded = uploadedPhotos.find(({ source }) => source === photo);
              return uploaded?.result ? { ...photo, id: uploaded.result.id, uploaded: true } : photo;
            }),
            audios: prev.audios.map((audio) => {
              const uploaded = uploadedAudios.find(({ source }) => source === audio);
              return uploaded?.result
                ? { ...audio, id: uploaded.result.id, label: uploaded.result.label ?? audio.label }
                : audio;
            }),
          }));
        }

        mediaFailed = [...photoResults, ...audioResults].filter(({ result }) => result == null).length;
      }

      if (mediaFailed > 0) {
        Alert.alert(
          'Một số file chưa lưu được',
          `Nội dung nhật ký đã lưu, nhưng ${mediaFailed}/${mediaTotal} file media chưa upload thành công. File vẫn còn trên màn hình này, vui lòng bấm lưu lại để thử lại.`
        );
      } else {
        setToastVisible(true);
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        const existingId = error.response.data?.existingId;
        Alert.alert(
          'Đã có nhật ký hôm nay',
          'Bạn muốn chỉnh sửa không?',
          [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Chỉnh sửa', onPress: () => router.replace(`/tabs/journal/${existingId}?edit=true`) },
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Không lưu được, thử lại nhé!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!canSave) {
      router.replace('/tabs/journal');
      return;
    }
    Alert.alert(
      'Lưu nhật ký hôm nay?',
      'Bạn đã nhập một số nội dung. Bạn có muốn lưu lại không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Không lưu', style: 'destructive', onPress: () => router.replace('/tabs/journal') },
        { text: 'Lưu', onPress: handleSubmit },
      ]
    );
  };

  const dateStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <SafeAreaView style={s.safe}>

      <View style={h.header}>
        <TouchableOpacity onPress={handleCancel} style={h.headerBtn}>
          <Text style={h.headerBtnText}>‹</Text>
        </TouchableOpacity>

        <Text style={h.headerDate}>{dateStr}</Text>

        <View style={h.headerRight}>
          <TouchableOpacity
            style={[h.saveBtn, !canSave && h.saveBtnOff]}
            onPress={handleSubmit}
            disabled={loading || !canSave}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <CheckLineIcon size={19} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <JournalEntryForm logId={createdLogId ?? undefined} onChange={setFormData} />
        <View style={s.bottomSpacer} />
      </ScrollView>

      {toastVisible && (
        <Animated.View
          style={[t.toast, {
            opacity: toastAnim,
            transform: [{ translateY: toastAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }],
          }]}
        >
          <Text style={t.toastIcon}>OK</Text>
          <View>
            <Text style={t.toastTitle}>Đã lưu nhật ký!</Text>
            <Text style={t.toastSub}>Đang quay lại...</Text>
          </View>
        </Animated.View>
      )}

    </SafeAreaView>
  );
}
