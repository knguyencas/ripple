import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, Animated, FlatList, Modal,
  NativeScrollEvent, NativeSyntheticEvent, Platform, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import JournalEntryForm, { JournalFormData, AudioItem, PhotoItem } from '../../../components/journal/JournalEntryForm';
import { SoraMoodIcon, type SoraMoodExpression } from '../../../components/shared/Sora';
import { SORA_MOOD_EXPRESSIONS } from '../../../components/mood/MoodWheel';
import {
  J,
  journalHeaderStyles as h,
  journalToastStyles as t,
  journalDetailStyles as s
} from '../../../styles/journal/journal.styles';
import { MOODS } from '../../../components/mood/MoodWheel';
import api from '../../../services/core/api';
import { isApiConnectivityError } from '../../../services/core/api-connectivity';
import { cacheGet, cacheSet } from '../../../services/core/cache.service';
import { uploadLogMedia } from '../../../services/journal/log-media.service';
import { decryptRemoteMedia, revokeDecryptedMediaUri } from '../../../services/journal/media-crypto.service';
import AppIconButton from '../../../components/shared/AppIconButton';
import {
  CheckLineIcon,
  ChevronLeftLineIcon,
  ChevronRightLineIcon,
  CloseLineIcon,
  PauseLineIcon,
  PlayLineIcon,
} from '../../../components/shared/AppIcons';
import { confirmDestructiveAction } from '../../../utils/shared/confirm-action.utils';

function softenMoodColor(hexColor: string) {
  const hex = hexColor.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#F1F6F8';

  const amount = 0.24;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(255 - (255 - channel) * amount);

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function LogDetailScreen() {
  const router = useRouter();
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const editReturnTo = `/tabs/journal/${id}?edit=true`;
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();

  const [log,       setLog]       = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [isEditing, setIsEditing] = useState(edit === 'true');


  const [formData, setFormData] = useState<JournalFormData>({
    mood: null, note: '', photos: [], audios: [],
  });
  const [initialData, setInitialData] = useState<JournalFormData>({
    mood: null, note: '', photos: [], audios: [],
  });

  const [viewerVisible, setViewerVisible] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [loadingAudioKey, setLoadingAudioKey] = useState<string | null>(null);
  const imageListRef = useRef<FlatList<PhotoItem>>(null);
  const audioSoundRef = useRef<Audio.Sound | null>(null);
  const decryptedMediaUrisRef = useRef<string[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchLog(); }, [id]);

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

  useEffect(() => {
    return () => {
      void stopAudio();
      clearDecryptedMediaUris();
    };
  }, []);

  const clearDecryptedMediaUris = () => {
    decryptedMediaUrisRef.current.forEach(revokeDecryptedMediaUri);
    decryptedMediaUrisRef.current = [];
  };

  const getAudioKey = (audio: AudioItem, index: number) => audio.id ?? `${audio.uri}-${index}`;

  const stopAudio = async () => {
    const sound = audioSoundRef.current;
    audioSoundRef.current = null;
    setPlayingAudioKey(null);
    if (!sound) return;
    try {
      await sound.stopAsync().catch(() => {});
      await sound.unloadAsync().catch(() => {});
    } catch {}
  };

  const toggleAudio = async (audio: AudioItem, index: number) => {
    const key = getAudioKey(audio, index);
    if (playingAudioKey === key) {
      await stopAudio();
      return;
    }

    setLoadingAudioKey(key);
    await stopAudio();
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: audio.uri },
        { shouldPlay: true }
      );
      audioSoundRef.current = sound;
      setPlayingAudioKey(key);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void stopAudio();
        }
      });
    } catch {
      Alert.alert('Lỗi', 'Không thể phát file ghi âm.');
    } finally {
      setLoadingAudioKey(null);
    }
  };

  const openPhotoViewer = (index: number) => {
    setActivePhotoIndex(index);
    setViewerVisible(true);
  };

  const closePhotoViewer = () => {
    setViewerVisible(false);
  };

  const scrollToPhoto = (index: number) => {
    if (index < 0 || index >= formData.photos.length) return;
    setActivePhotoIndex(index);
    imageListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handlePhotoScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, viewportWidth));
    setActivePhotoIndex(Math.max(0, Math.min(index, formData.photos.length - 1)));
  };

  const fetchLog = async (showErrorAlert = true) => {
    try {
      const res  = await api.get(`/logs/${id}`);
      const data = res.data;
      setLog(data);

      clearDecryptedMediaUris();

      const photos = await Promise.all((data.photoAttachments ?? data.photos ?? []).map(async (p: any) => {
        let uri = p.url ?? p.uri;
        if (p.encrypted && p.iv && p.url) {
          try {
            uri = await decryptRemoteMedia(p.url, p.iv, p.mimeType);
            decryptedMediaUrisRef.current.push(uri);
          } catch (error) {
            console.warn('decrypt photo failed:', error);
          }
        }
        return {
          id: p.id,
          uri,
          uploaded: true,
          encrypted: Boolean(p.encrypted),
          iv: p.iv ?? null,
          mimeType: p.mimeType ?? null,
        };
      }));
      const audios = await Promise.all((data.audioRecordings ?? data.audios ?? []).map(async (a: any) => {
        let uri = a.url ?? a.uri;
        if (a.encrypted && a.iv && a.url) {
          try {
            uri = await decryptRemoteMedia(a.url, a.iv, a.mimeType);
            decryptedMediaUrisRef.current.push(uri);
          } catch (error) {
            console.warn('decrypt audio failed:', error);
          }
        }
        return {
          id: a.id,
          uri,
          label: a.label ?? '',
          encrypted: Boolean(a.encrypted),
          iv: a.iv ?? null,
          mimeType: a.mimeType ?? null,
        };
      })) as AudioItem[];

      const loadedData: JournalFormData = {
        mood:   MOODS.find(m => m.name === data.mood) ?? null,
        note:   data.note ?? '',
        photos,
        audios,
      };
      setFormData(loadedData);
      setInitialData(loadedData);
      setFromCache(false);
      void cacheSet(`journal_log_${id}`, { data, photos, audios });
    } catch (e) {
      if (isApiConnectivityError(e)) {
        const cached = await cacheGet<{ data: any; photos: any[]; audios: any[] }>(`journal_log_${id}`);
        if (cached) {
          setLog(cached.data);
          const loadedData: JournalFormData = {
            mood:   MOODS.find(m => m.name === cached.data.mood) ?? null,
            note:   cached.data.note ?? '',
            photos: cached.photos,
            audios: cached.audios,
          };
          setFormData(loadedData);
          setInitialData(loadedData);
          setFromCache(true);
        } else if (showErrorAlert && loading) {
          Alert.alert('Không có mạng', 'Entry này chưa được tải về trước đó.');
          router.navigate('/tabs/journal');
        }
      } else if (showErrorAlert && loading) {
        Alert.alert('Lỗi', 'Không tải được nhật ký');
        router.navigate('/tabs/journal');
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadPendingMedia = async () => {
    const photoTargets = formData.photos.filter((p) => !p.id);
    const audioTargets = formData.audios.filter((a) => !a.id);
    const total = photoTargets.length + audioTargets.length;
    if (!total) return { total: 0, failed: 0 };

    const photoResults = await Promise.all(
      photoTargets.map(async (photo) => ({ source: photo, result: await uploadLogMedia(id, photo, 'photo') }))
    );
    const audioResults = await Promise.all(
      audioTargets.map(async (audio) => ({ source: audio, result: await uploadLogMedia(id, audio, 'audio') }))
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

    return {
      total,
      failed: [...photoResults, ...audioResults].filter(({ result }) => result == null).length,
    };
  };

  const handleSave = async (): Promise<boolean> => {
    setSaving(true);
    try {
      await api.put(`/logs/${id}`, {
        mood:      formData.mood?.name  ?? log.mood,
        moodScore: formData.mood?.score ?? log.moodScore,
        factors:   log.factors ?? [],
        note:      formData.note.trim() || null,
      });

      const mediaResult = await uploadPendingMedia();
      if (mediaResult.failed > 0) {
        Alert.alert(
          'Một số file chưa lưu được',
          `Nội dung nhật ký đã lưu, nhưng ${mediaResult.failed}/${mediaResult.total} file media chưa upload thành công. Vui lòng thử lưu lại.`
        );
        return true;
      }

      setIsEditing(false);
      setToastVisible(true);
      return true;
    } catch {
      Alert.alert('Lỗi', 'Không lưu được, thử lại nhé!');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    confirmDestructiveAction({
      title: 'Xoá nhật ký?',
      message: 'Hành động này không thể hoàn tác.',
      confirmText: 'Xoá',
      errorMessage: 'Không xoá được.',
      onConfirm: async () => {
        await api.delete(`/logs/${id}`);
        router.navigate('/tabs/journal');
      },
    });
  };

  const isDirty = () => {
    if (!log) return false;
    const origNote = log.note ?? '';
    const origMood = log.mood ?? '';
    const hasPendingMedia =
      formData.photos.some((photo) => !photo.id) ||
      formData.audios.some((audio) => !audio.id);
    return formData.note !== origNote || (formData.mood?.name ?? '') !== origMood || hasPendingMedia;
  };

  const handleBack = () => {
    if (isEditing && isDirty()) {
      Alert.alert(
        'Lưu thay đổi?',
        'Bạn đã chỉnh sửa nhật ký. Bạn có muốn lưu lại không?',
        [
          { text: 'Tiếp tục sửa', style: 'cancel' },
          {
            text: 'Không lưu', style: 'destructive',
            onPress: () => router.navigate('/tabs/journal'),
          },
          {
            text: 'Lưu',
            onPress: async () => {
              const ok = await handleSave();
              if (!ok) return;
            },
          },
        ]
      );
      return;
    }
    router.navigate('/tabs/journal');
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator style={s.loadingIndicator} color={J.accent} />
      </SafeAreaView>
    );
  }

  const date    = new Date(log.createdAt);
  const dateStr = date.toLocaleDateString('vi-VN', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <SafeAreaView style={s.safe}>


      {fromCache && (
        <View style={{ backgroundColor: '#FFF8E1', paddingVertical: 7, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 12, color: '#856404', textAlign: 'center' }}>
            Đang xem dữ liệu đã lưu · Không thể chỉnh sửa khi offline
          </Text>
        </View>
      )}

      <View style={h.header}>
        <TouchableOpacity onPress={handleBack} style={h.headerBtn}>
          <Text style={h.headerBtnText}>‹</Text>
        </TouchableOpacity>

        <Text style={h.headerDate} numberOfLines={1}>{dateStr}</Text>

        <View style={h.headerRight}>
          <AppIconButton
            icon="trash"
            onPress={handleDelete}
            accessibilityLabel="Xoá nhật ký"
          />

          {isToday && !fromCache && (
            isEditing ? (
              <TouchableOpacity
                style={[h.saveBtn, saving && h.saveBtnOff]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <CheckLineIcon size={19} />
                )}
              </TouchableOpacity>
            ) : (
              <AppIconButton
                icon="edit"
                onPress={() => {
                  setIsEditing(true);
                  router.setParams({ edit: 'true' });
                }}
                accessibilityLabel="Chỉnh sửa nhật ký"
              />
            )
          )}
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isEditing ? (

          <JournalEntryForm
            logId={id}
            pinSetupReturnTo={editReturnTo}
            initialMood={initialData.mood}
            initialNote={initialData.note}
            initialPhotos={initialData.photos}
            initialAudios={initialData.audios}
            onChange={setFormData}
          />
        ) : (

          <>

            <View style={[
              s.card,
              s.moodSummaryCard,
              formData.mood && { backgroundColor: softenMoodColor(formData.mood.color) },
            ]}>
              <View style={s.moodRow}>
                <View style={s.moodIconWrap}>
                  {formData.mood ? (
                    <SoraMoodIcon
                      size={36}
                      expression={
                        (SORA_MOOD_EXPRESSIONS[
                          MOODS.findIndex(m => m.name === formData.mood?.name)
                        ] ?? 'neutral') as SoraMoodExpression
                      }
                    />
                  ) : null}
                </View>
                <View style={s.moodTextWrap}>
                  <Text style={s.moodName} numberOfLines={1}>{formData.mood?.name ?? log.mood ?? 'Chưa có tâm trạng'}</Text>
                  <Text style={s.moodDesc} numberOfLines={1}>{formData.mood?.desc ?? ''}</Text>
                </View>
              </View>
            </View>


            <View style={s.card}>
              <Text style={s.cardTitle}>Nhật ký</Text>
              {formData.note ? (
                <Text style={s.noteText}>{formData.note}</Text>
              ) : (
                <Text style={s.noteEmpty}>Không có ghi chú</Text>
              )}
            </View>


            {formData.photos.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Ảnh của bạn</Text>
                <View style={s.photosGrid}>
                  {formData.photos.map((photo, i) => (
                    <TouchableOpacity
                      key={photo.id ?? `${photo.uri}-${i}`}
                      style={s.photoWrap}
                      activeOpacity={0.86}
                      onPress={() => openPhotoViewer(i)}
                      accessibilityRole="button"
                      accessibilityLabel={`Xem ảnh ${i + 1}`}
                    >
                      <Image source={{ uri: photo.uri }} style={s.photo} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}


            {formData.audios.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Ghi âm</Text>
                {formData.audios.map((audio, i) => (
                  <View
                    key={audio.id ?? `${audio.uri}-${i}`}
                    style={[
                      s.audioRow,
                      playingAudioKey === getAudioKey(audio, i) && s.audioRowActive,
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        s.audioPlayBtn,
                        loadingAudioKey === getAudioKey(audio, i) && s.audioPlayBtnLoading,
                      ]}
                      onPress={() => toggleAudio(audio, i)}
                      disabled={loadingAudioKey === getAudioKey(audio, i)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        playingAudioKey === getAudioKey(audio, i)
                          ? 'Dừng phát ghi âm'
                          : 'Phát ghi âm'
                      }
                    >
                      {loadingAudioKey === getAudioKey(audio, i) ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : playingAudioKey === getAudioKey(audio, i) ? (
                        <PauseLineIcon size={16} />
                      ) : (
                        <PlayLineIcon size={16} />
                      )}
                    </TouchableOpacity>
                    <Text style={s.audioLabel}>{audio.label || `Ghi âm ${i + 1}`}</Text>
                  </View>
                ))}
              </View>
            )}


          </>
        )}

        <View style={s.bottomSpacer} />
      </ScrollView>

      <Modal visible={viewerVisible && formData.photos.length > 0} transparent animationType="fade" onRequestClose={closePhotoViewer}>
        <View style={s.imageViewerOverlay}>
          <View style={s.imageViewerHeader}>
            <TouchableOpacity
              style={s.imageViewerBtn}
              onPress={closePhotoViewer}
              accessibilityRole="button"
              accessibilityLabel="Đóng xem ảnh"
            >
              <CloseLineIcon size={20} />
            </TouchableOpacity>
            <Text style={s.imageViewerCounter}>
              {activePhotoIndex + 1}/{formData.photos.length}
            </Text>
            <View style={s.imageViewerBtn} />
          </View>

          <FlatList
            ref={imageListRef}
            data={formData.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.max(0, Math.min(activePhotoIndex, formData.photos.length - 1))}
            getItemLayout={(_, index) => ({
              length: viewportWidth,
              offset: viewportWidth * index,
              index,
            })}
            keyExtractor={(photo, index) => photo.id ?? `${photo.uri}-${index}`}
            onMomentumScrollEnd={handlePhotoScrollEnd}
            renderItem={({ item }) => (
              <View style={[s.imageViewerSlide, { width: viewportWidth, height: viewportHeight }]}>
                <Image source={{ uri: item.uri }} style={s.imageViewerImage} resizeMode="contain" />
              </View>
            )}
          />

          <TouchableOpacity
            style={[
              s.imageViewerNav,
              s.imageViewerNavLeft,
              activePhotoIndex <= 0 && s.imageViewerNavDisabled,
            ]}
            onPress={() => scrollToPhoto(activePhotoIndex - 1)}
            disabled={activePhotoIndex <= 0}
            accessibilityRole="button"
            accessibilityLabel="Ảnh trước"
          >
            <ChevronLeftLineIcon size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              s.imageViewerNav,
              s.imageViewerNavRight,
              activePhotoIndex >= formData.photos.length - 1 && s.imageViewerNavDisabled,
            ]}
            onPress={() => scrollToPhoto(activePhotoIndex + 1)}
            disabled={activePhotoIndex >= formData.photos.length - 1}
            accessibilityRole="button"
            accessibilityLabel="Ảnh tiếp theo"
          >
            <ChevronRightLineIcon size={24} />
          </TouchableOpacity>
        </View>
      </Modal>

      {toastVisible && (
        <Animated.View
          style={[t.toast, {
            opacity: toastAnim,
            transform: [{ translateY: toastAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }],
          }]}
        >
          <Text style={t.toastIcon}>OK</Text>
          <View>
            <Text style={t.toastTitle}>Đã lưu thay đổi!</Text>
            <Text style={t.toastSub}>Đang quay lại...</Text>
          </View>
        </Animated.View>
      )}

    </SafeAreaView>
  );
}

