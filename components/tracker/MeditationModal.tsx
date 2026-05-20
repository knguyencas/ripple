import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import { meditationModalStyles as s } from '../../styles/tracker/meditation-modal.styles';
import {
  fetchSounds,
  type MeditationSound,
} from '../../services/tracker/meditation.service';
import {
  isDownloaded,
  downloadSound,
  getLocalUri,
} from '../../services/tracker/meditation-download.service';
import {
  DURATION_OPTIONS,
  DEFAULT_DURATION,
  type DurationMin,
} from '../../constants/tracker/meditation.constants';
import { formatFileSize } from '../../utils/tracker/meditation.utils';
import { DownloadLineIcon } from '../shared/AppIcons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSessionSaved?: (actualMin: number) => void;
}

function blurActiveElementOnWeb() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const activeElement = document.activeElement as { blur?: () => void } | null;
  activeElement?.blur?.();
}

export default function MeditationModal({ visible, onClose }: Props) {
  const [sounds, setSounds] = useState<MeditationSound[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [downloadedSet, setDownloadedSet] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null);
  const [duration, setDuration] = useState<DurationMin>(DEFAULT_DURATION);
  const [previewingSoundId, setPreviewingSoundId] = useState<string | null>(null);
  const [downloadToastVisible, setDownloadToastVisible] = useState(false);

  const canCacheAudio = Platform.OS !== 'web';
  const previewSoundRef = useRef<Audio.Sound | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPreview = useCallback(async () => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    const sound = previewSoundRef.current;
    previewSoundRef.current = null;
    setPreviewingSoundId(null);
    if (!sound) return;

    try {
      await sound.stopAsync().catch(() => {});
      await sound.unloadAsync().catch(() => {});
    } catch {}
  }, []);

  const showDownloadToast = useCallback(() => {
    if (downloadToastTimerRef.current) {
      clearTimeout(downloadToastTimerRef.current);
      downloadToastTimerRef.current = null;
    }

    setDownloadToastVisible(true);
    downloadToastTimerRef.current = setTimeout(() => {
      setDownloadToastVisible(false);
      downloadToastTimerRef.current = null;
    }, 2800);
  }, []);

  const previewSound = useCallback(
    async (meditationSound: MeditationSound) => {
      await stopPreview();
      const uri = canCacheAudio && downloadedSet.has(meditationSound.id)
        ? getLocalUri(meditationSound.id)
        : meditationSound.url;

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound: audioSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true, isLooping: false, volume: 0.85 }
        );

        previewSoundRef.current = audioSound;
        setPreviewingSoundId(meditationSound.id);
        audioSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            void stopPreview();
          }
        });

        previewTimerRef.current = setTimeout(() => {
          void stopPreview();
        }, 10_000);
      } catch (e) {
        setPreviewingSoundId(null);
        console.warn('Preview meditation sound failed:', e);
      }
    },
    [canCacheAudio, downloadedSet, stopPreview]
  );

  useEffect(() => {
    if (!visible) void stopPreview();
  }, [visible, stopPreview]);

  useEffect(() => {
    return () => {
      if (downloadToastTimerRef.current) {
        clearTimeout(downloadToastTimerRef.current);
        downloadToastTimerRef.current = null;
      }
      void stopPreview();
    };
  }, [stopPreview]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    (async () => {
      setLoadingCatalog(true);
      try {
        const list = await fetchSounds();
        const downloaded = new Set<string>();

        if (canCacheAudio) {
          for (const sound of list) {
            if (await isDownloaded(sound.id)) downloaded.add(sound.id);
          }
        }

        if (cancelled) return;
        setSounds(list);
        setDownloadedSet(downloaded);
        setSelectedSoundId((current) => {
          if (current && list.some((sound) => sound.id === current)) return current;
          return list[0]?.id ?? null;
        });
      } catch (e) {
        console.warn('Load meditation catalog failed:', e);
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, canCacheAudio]);

  const handleDownload = useCallback(
    async (sound: MeditationSound) => {
      if (downloadingId) return;
      setDownloadingId(sound.id);
      setDownloadProgress(0);

      try {
        setDownloadToastVisible(false);
        await downloadSound(sound.id, sound.url, (ratio) => setDownloadProgress(ratio));
        setDownloadedSet((prev) => new Set(prev).add(sound.id));
        setSelectedSoundId(sound.id);
      } catch (e) {
        Alert.alert('Tải xuống thất bại', 'Vui lòng kiểm tra kết nối và thử lại.');
        console.warn('Download failed:', e);
      } finally {
        setDownloadingId(null);
        setDownloadProgress(0);
      }
    },
    [downloadingId]
  );

  const handleClose = useCallback(() => {
    void stopPreview();
    onClose();
  }, [onClose, stopPreview]);

  const handleStart = useCallback(async () => {
    if (!selectedSoundId) return;
    const selectedSound = sounds.find((sound) => sound.id === selectedSoundId);
    if (!selectedSound) return;

    await stopPreview();

    if (canCacheAudio && !downloadedSet.has(selectedSound.id)) {
      showDownloadToast();
      return;
    }

    blurActiveElementOnWeb();
    onClose();
    router.push({
      pathname: '/tabs/meditation-session',
      params: {
        soundId: selectedSound.id,
        duration: String(duration),
      },
    });
  }, [
    canCacheAudio,
    downloadedSet,
    duration,
    onClose,
    selectedSoundId,
    showDownloadToast,
    sounds,
    stopPreview,
  ]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.headerRow}>
            <Text style={s.title}>Thiền</Text>
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Text style={s.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.subtitle}>Chọn âm thanh và thời lượng cho phiên hôm nay.</Text>

          <Text style={s.sectionLabel}>Chọn âm thanh</Text>
          {loadingCatalog ? (
            <ActivityIndicator style={s.catalogLoading} />
          ) : sounds.length === 0 ? (
            <Text style={s.emptyText}>Chưa có nhạc thiền. Vui lòng thử lại sau.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.soundsScroll}
            >
              {sounds.map((sound) => {
                const isActive = sound.id === selectedSoundId;
                const isDownloadedOrWeb = !canCacheAudio || downloadedSet.has(sound.id);
                const isCurrentlyDownloading = downloadingId === sound.id;

                return (
                  <TouchableOpacity
                    key={sound.id}
                    style={[s.soundCard, isActive && s.soundCardActive]}
                    onPress={() => {
                      setSelectedSoundId(sound.id);
                      setDownloadToastVisible(false);
                      void previewSound(sound);
                    }}
                    activeOpacity={0.8}
                    disabled={isCurrentlyDownloading}
                  >
                    <Text style={s.soundName} numberOfLines={1}>{sound.name}</Text>
                    <Text style={s.soundDesc} numberOfLines={2}>{sound.description}</Text>

                    {isCurrentlyDownloading ? (
                      <View style={s.soundProgressBar}>
                        <View
                          style={[
                            s.soundProgressFill,
                            { width: `${Math.round(downloadProgress * 100)}%` },
                          ]}
                        />
                      </View>
                    ) : previewingSoundId === sound.id ? (
                      <View style={s.soundStatus}>
                        <Text style={s.soundStatusText}>Nghe thử</Text>
                      </View>
                    ) : isDownloadedOrWeb ? (
                      <View style={s.soundStatus}>
                        <Text style={s.soundStatusText}>Sẵn sàng</Text>
                      </View>
                    ) : (
                      <View style={[s.soundStatus, s.soundStatusInactive]}>
                        <Text style={[s.soundStatusText, s.soundStatusInactiveText]}>
                          Chưa tải · {formatFileSize(sound.fileSizeMB)}
                        </Text>
                      </View>
                    )}

                    {!isDownloadedOrWeb && canCacheAudio && (
                      <TouchableOpacity
                        style={s.soundDownloadBtn}
                        onPress={(event) => {
                          event.stopPropagation();
                          void handleDownload(sound);
                        }}
                        disabled={isCurrentlyDownloading}
                        activeOpacity={0.8}
                      >
                        {isCurrentlyDownloading ? (
                          <ActivityIndicator size="small" color="#2E6F8E" />
                        ) : (
                          <DownloadLineIcon size={16} color="#2E6F8E" />
                        )}
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <Text style={s.sectionLabel}>Thời lượng</Text>
          <View style={s.durationRow}>
            {DURATION_OPTIONS.map((minute) => {
              const active = duration === minute;
              return (
                <TouchableOpacity
                  key={minute}
                  style={[s.durationChip, active && s.durationChipActive]}
                  onPress={() => setDuration(minute)}
                >
                  <Text
                    style={[s.durationChipText, active && s.durationChipTextActive]}
                    numberOfLines={1}
                  >
                    {minute} phút
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.actions}>
            {downloadToastVisible && (
              <View style={s.downloadToast}>
                <Text style={s.downloadToastText}>
                  Bạn cần tải âm thanh trước. Nhấn icon tải ở góc dưới phải của âm thanh.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                s.primaryBtn,
                (!selectedSoundId || loadingCatalog) && s.primaryBtnDisabled,
              ]}
              onPress={handleStart}
              disabled={!selectedSoundId || loadingCatalog || downloadingId != null}
            >
              <Text style={s.primaryBtnText}>
                {selectedSoundId && canCacheAudio && !downloadedSet.has(selectedSoundId)
                  ? 'Cần tải âm thanh'
                  : 'Bắt đầu thiền'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
