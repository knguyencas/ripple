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
import {
  meditationModalStyles as s,
  meditationAwayDialogStyles as d,
} from '../../styles/tracker/meditation-modal.styles';
import {
  fetchSounds,
  createSession,
  type MeditationSound,
} from '../../services/tracker/meditation.service';
import {
  isDownloaded,
  downloadSound,
  getLocalUri,
} from '../../services/tracker/meditation-download.service';
import { useMeditationSession } from '../../hooks/tracker/useMeditationSession';
import {
  DURATION_OPTIONS,
  DEFAULT_DURATION,
  type DurationMin,
} from '../../constants/tracker/meditation.constants';
import {
  formatCountdown,
  formatFileSize,
} from '../../utils/tracker/meditation.utils';
import { Audio } from 'expo-av';
import { DownloadLineIcon } from '../shared/AppIcons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSessionSaved?: (actualMin: number) => void;
}

export default function MeditationModal({ visible, onClose, onSessionSaved }: Props) {
  const [sounds, setSounds] = useState<MeditationSound[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [downloadedSet, setDownloadedSet] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null);
  const [duration, setDuration] = useState<DurationMin>(DEFAULT_DURATION);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [closeConfirmVisible, setCloseConfirmVisible] = useState(false);
  const [previewingSoundId, setPreviewingSoundId] = useState<string | null>(null);
  const canCacheAudio = Platform.OS !== 'web';
  const previewSoundRef = useRef<Audio.Sound | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [downloadToastVisible, setDownloadToastVisible] = useState(false);

  const { state: session, start, pause, resume, stopAndSave, cancel, dismissAwayDialog } =
    useMeditationSession(async (actualMin) => {
      await persistSession(actualMin);
    });

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
        setSelectedSoundId(null);
      } catch (e) {
        console.warn('Load meditation catalog failed:', e);
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => { cancelled = true; };
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

  const persistSession = useCallback(
    async (actualMin: number) => {
      if (!selectedSoundId || !sessionStartedAt) return;
      if (actualMin < 1) return;

      setSavingSession(true);
      try {
        await createSession({
          soundId: selectedSoundId,
          targetMin: duration,
          actualMin,
          startedAt: sessionStartedAt.toISOString(),
          completedAt: new Date().toISOString(),
        });
        onSessionSaved?.(actualMin);
      } catch (e) {
        Alert.alert('Lưu thất bại', 'Phiên thiền chưa được lưu lên server. Vui lòng thử lại.');
        console.warn('Save session failed:', e);
      } finally {
        setSavingSession(false);
      }
    },
    [selectedSoundId, duration, sessionStartedAt, onSessionSaved]
  );

  const handleStart = useCallback(async () => {
    if (!selectedSoundId) return;
    const sound = sounds.find((sd) => sd.id === selectedSoundId);
    if (!sound) return;
    await stopPreview();

    if (canCacheAudio && !downloadedSet.has(selectedSoundId)) {
      showDownloadToast();
      return;
    }
    const uri = canCacheAudio ? getLocalUri(selectedSoundId) : sound.url;
    setSessionStartedAt(new Date());
    await start({ audioUri: uri, targetMin: duration });
  }, [selectedSoundId, downloadedSet, sounds, duration, start, canCacheAudio, stopPreview, showDownloadToast]);

  const handleStopAndSave = useCallback(async () => {
    const actualMin = await stopAndSave();
    if (actualMin >= 1) {
      await persistSession(actualMin);
    }
    setSessionStartedAt(null);
  }, [stopAndSave, persistSession]);

  const handleClose = useCallback(() => {
    if (session.status === 'idle' || session.status === 'completed') {
      void stopPreview();
      onClose();
      return;
    }
    void pause('user');
    setCloseConfirmVisible(true);
  }, [session.status, pause, onClose, stopPreview]);

  const handleResumeFromClose = useCallback(() => {
    setCloseConfirmVisible(false);
    void resume();
  }, [resume]);

  const handleSaveAndClose = useCallback(async () => {
    setCloseConfirmVisible(false);
    await handleStopAndSave();
    onClose();
  }, [handleStopAndSave, onClose]);

  const handleDiscardAndClose = useCallback(async () => {
    setCloseConfirmVisible(false);
    await cancel();
    setSessionStartedAt(null);
    onClose();
  }, [cancel, onClose]);

  const inSession = session.status === 'playing' || session.status === 'paused';
  const remainingSec = Math.max(0, session.targetSec - session.elapsedSec);
  const showingConfirm = session.showAwayDialog || closeConfirmVisible;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          {showingConfirm ? (
            <>
              <Text style={d.title}>
                {session.showAwayDialog ? 'Phiên thiền đã tạm dừng' : 'Tạm dừng phiên thiền?'}
              </Text>
              <Text style={d.body}>
                {session.showAwayDialog ? (
                  <>
                    Bạn đã rời app <Text style={d.bodyBold}>{session.awayDurationSec} giây</Text>.
                    Đã thiền:{' '}
                    <Text style={d.bodyBold}>
                      {Math.floor(session.elapsedSec / 60)} phút {session.elapsedSec % 60} giây
                    </Text>
                    .
                  </>
                ) : (
                  <>
                    Bạn đã thiền được{' '}
                    <Text style={d.bodyBold}>
                      {Math.floor(session.elapsedSec / 60)} phút {session.elapsedSec % 60} giây
                    </Text>
                    . Bạn muốn tiếp tục hay thoát phiên này?
                  </>
                )}
              </Text>
              <View style={d.actionsStack}>
                <TouchableOpacity
                  style={[d.stackBtn, d.stackPrimaryBtn]}
                  onPress={() => {
                    dismissAwayDialog();
                    handleResumeFromClose();
                  }}
                >
                  <Text style={d.resumeText}>Tiếp tục thiền</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[d.stackBtn, d.stackSecondaryBtn]} onPress={handleSaveAndClose}>
                  <Text style={d.endText}>Kết thúc & lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[d.stackBtn, d.dangerBtn]} onPress={handleDiscardAndClose}>
                  <Text style={d.dangerText}>Thoát không lưu</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
          <View style={s.headerRow}>
            <Text style={s.title}>Thiền</Text>
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Text style={s.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.subtitle}>Hít thở chậm rãi, thư giãn cơ thể.</Text>

          {!inSession && session.status !== 'completed' && (
            <>
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
                  {sounds.map((sd) => {
                    const isActive = sd.id === selectedSoundId;
                    const isDl = !canCacheAudio || downloadedSet.has(sd.id);
                    const isCurrentlyDownloading = downloadingId === sd.id;

                    return (
                      <TouchableOpacity
                        key={sd.id}
                        style={[s.soundCard, isActive && s.soundCardActive]}
                        onPress={() => {
                          setSelectedSoundId(sd.id);
                          setDownloadToastVisible(false);
                          void previewSound(sd);
                        }}
                        activeOpacity={0.8}
                        disabled={isCurrentlyDownloading}
                      >
                        <Text style={s.soundName} numberOfLines={1}>{sd.name}</Text>
                        <Text style={s.soundDesc} numberOfLines={2}>{sd.description}</Text>

                        {isCurrentlyDownloading ? (
                          <View style={s.soundProgressBar}>
                            <View
                              style={[s.soundProgressFill, { width: `${Math.round(downloadProgress * 100)}%` }]}
                            />
                          </View>
                        ) : previewingSoundId === sd.id ? (
                          <View style={s.soundStatus}>
                            <Text style={s.soundStatusText}>Nghe thử</Text>
                          </View>
                        ) : isDl ? (
                          <View style={s.soundStatus}>
                            <Text style={s.soundStatusText}>Đã tải</Text>
                          </View>
                        ) : (
                          <View style={[s.soundStatus, s.soundStatusInactive]}>
                            <Text style={[s.soundStatusText, s.soundStatusInactiveText]}>
                              Chưa tải · {formatFileSize(sd.fileSizeMB)}
                            </Text>
                          </View>
                        )}

                        {!isDl && canCacheAudio && (
                          <TouchableOpacity
                            style={s.soundDownloadBtn}
                            onPress={(event) => {
                              event.stopPropagation();
                              void handleDownload(sd);
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
            </>
          )}

          {(inSession || session.status === 'completed') && (
            <View style={s.hero}>
              <Text style={s.heroCountdown}>{formatCountdown(remainingSec)}</Text>
              <Text style={s.heroSub}>
                {session.status === 'completed'
                  ? `Đã thiền ${Math.round(session.targetSec / 60)} phút`
                  : session.status === 'paused'
                    ? `Đang tạm dừng — ${Math.floor(session.elapsedSec / 60)} phút đã trôi qua`
                    : `Còn lại / ${duration} phút`}
              </Text>
            </View>
          )}

          <View style={s.actions}>
            {downloadToastVisible && (
              <View style={s.downloadToast}>
                <Text style={s.downloadToastText}>
                  Bạn cần tải âm thanh trước. Nhấn icon tải ở góc dưới phải của âm thanh.
                </Text>
              </View>
            )}

            {session.status === 'idle' && (
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
                    ? `Cần tải âm thanh`
                    : 'Bắt đầu thiền'}
                </Text>
              </TouchableOpacity>
            )}

            {session.status === 'playing' && (
              <TouchableOpacity style={s.primaryBtn} onPress={() => void pause('user')}>
                <Text style={s.primaryBtnText}>Tạm dừng</Text>
              </TouchableOpacity>
            )}

            {session.status === 'paused' && (
              <>
                <TouchableOpacity style={s.primaryBtn} onPress={() => void resume()}>
                  <Text style={s.primaryBtnText}>Tiếp tục</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.secondaryBtn} onPress={handleSaveAndClose}>
                  <Text style={s.secondaryBtnText}>Kết thúc & lưu</Text>
                </TouchableOpacity>
              </>
            )}

            {session.status === 'completed' && (
              <TouchableOpacity
                style={s.primaryBtn}
                onPress={() => { setSessionStartedAt(null); onClose(); }}
                disabled={savingSession}
              >
                {savingSession
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={s.primaryBtnText}>Hoàn tất</Text>}
              </TouchableOpacity>
            )}
          </View>
            </>
          )}
        </View>

        {false && (session.showAwayDialog || closeConfirmVisible) && (
          <View style={d.backdrop} pointerEvents="auto">
            <View style={d.card}>
              <Text style={d.title}>
                {session.showAwayDialog ? 'Phiên thiền đã tạm dừng' : 'Tạm dừng phiên thiền?'}
              </Text>
              <Text style={d.body}>
                {session.showAwayDialog ? (
                  <>
                    Bạn đã rời app <Text style={d.bodyBold}>{session.awayDurationSec} giây</Text>.
                    Đã thiền:{' '}
                    <Text style={d.bodyBold}>
                      {Math.floor(session.elapsedSec / 60)} phút {session.elapsedSec % 60} giây
                    </Text>
                    .
                  </>
                ) : (
                  <>
                    Bạn đã thiền được{' '}
                    <Text style={d.bodyBold}>
                      {Math.floor(session.elapsedSec / 60)} phút {session.elapsedSec % 60} giây
                    </Text>
                    . Bạn muốn tiếp tục hay thoát phiên này?
                  </>
                )}
              </Text>
              <View style={d.actionsStack}>
                <TouchableOpacity
                  style={[d.resumeBtn, d.stackBtn]}
                  onPress={() => {
                    dismissAwayDialog();
                    handleResumeFromClose();
                  }}
                >
                  <Text style={d.resumeText}>Tiếp tục thiền</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[d.endBtn, d.stackBtn]} onPress={handleSaveAndClose}>
                  <Text style={d.endText}>Kết thúc & lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[d.dangerBtn, d.stackBtn]} onPress={handleDiscardAndClose}>
                  <Text style={d.dangerText}>Thoát không lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
