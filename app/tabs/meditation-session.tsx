import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import {
  DEFAULT_DURATION,
  DURATION_OPTIONS,
  type DurationMin,
} from '../../constants/tracker/meditation.constants';
import {
  createSession,
  fetchToday as fetchMeditationToday,
  fetchSounds,
  type MeditationSound,
} from '../../services/tracker/meditation.service';
import {
  getLocalUri,
  isDownloaded,
} from '../../services/tracker/meditation-download.service';
import { useMeditationSession } from '../../hooks/tracker/useMeditationSession';
import { formatCountdown } from '../../utils/tracker/meditation.utils';
import { toDateKey } from '../../utils/shared/date.utils';
import { meditationSessionStyles as s } from '../../styles/tracker/meditation-session.styles';
import {
  ChevronLeftLineIcon,
  PauseLineIcon,
  PlayLineIcon,
} from '../../components/shared/AppIcons';

type SaveState = 'idle' | 'saving' | 'saved' | 'failed';

const RING_SIZE = 228;
const RING_RADIUS = 104;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const BREATHING_GUIDE_SECONDS = 30;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseDuration(value: string | string[] | undefined): DurationMin {
  const parsed = Number(firstParam(value));
  return DURATION_OPTIONS.includes(parsed as DurationMin)
    ? parsed as DurationMin
    : DEFAULT_DURATION;
}

export default function MeditationSessionScreen() {
  const params = useLocalSearchParams<{ soundId?: string; duration?: string }>();
  const soundId = firstParam(params.soundId);
  const duration = useMemo(() => parseDuration(params.duration), [params.duration]);

  const [sound, setSound] = useState<MeditationSound | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [todayMeditationMin, setTodayMeditationMin] = useState(0);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);
  const startedAtRef = useRef<Date | null>(null);
  const saveLockRef = useRef(false);
  const completionAlertShownRef = useRef(false);

  const waveA = useRef(new Animated.Value(0)).current;
  const waveB = useRef(new Animated.Value(0)).current;
  const waveC = useRef(new Animated.Value(0)).current;

  const persistSession = useCallback(
    async (actualMin: number) => {
      if (!soundId || actualMin < 1) return false;
      if (saveLockRef.current) return true;
      const startedAt = startedAtRef.current;
      if (!startedAt) return false;

      saveLockRef.current = true;
      setSaveState('saving');

      try {
        await createSession({
          soundId,
          targetMin: duration,
          actualMin,
          startedAt: startedAt.toISOString(),
          completedAt: new Date().toISOString(),
        });
        setTodayMeditationMin((current) => current + actualMin);
        setSaveState('saved');
        return true;
      } catch (e) {
        saveLockRef.current = false;
        setSaveState('failed');
        console.warn('Save meditation session failed:', e);
        return false;
      }
    },
    [duration, soundId]
  );

  const {
    state: session,
    start,
    pause,
    resume,
    stopAndSave,
    cancel,
    dismissAwayDialog,
  } = useMeditationSession(persistSession);

  useEffect(() => {
    const makeWave = (value: Animated.Value, delay: number) => {
      value.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 2600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const loops = [
      makeWave(waveA, 0),
      makeWave(waveB, 760),
      makeWave(waveC, 1520),
    ];

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [waveA, waveB, waveC]);

  useEffect(() => {
    let cancelled = false;

    if (!soundId) {
      setBootError('Thiếu âm thanh để bắt đầu phiên thiền.');
      setLoading(false);
      return () => {};
    }

    (async () => {
      setLoading(true);
      setBootError(null);
      saveLockRef.current = false;
      completionAlertShownRef.current = false;
      setSaveState('idle');
      setExitDialogVisible(false);

      try {
        const localDate = toDateKey(new Date());
        const [sounds, todayMeditation] = await Promise.all([
          fetchSounds(),
          fetchMeditationToday(localDate),
        ]);
        const selectedSound = sounds.find((item) => item.id === soundId);
        if (!selectedSound) {
          throw new Error('Selected meditation sound not found');
        }

        if (cancelled) return;
        setTodayMeditationMin(Number(todayMeditation?.totalMinutes ?? 0));
        setSound(selectedSound);

        const hasLocalFile = Platform.OS !== 'web' && await isDownloaded(selectedSound.id);
        const audioUri = hasLocalFile ? getLocalUri(selectedSound.id) : selectedSound.url;
        startedAtRef.current = new Date();

        const started = await start({ audioUri, targetMin: duration });
        if (!started && !cancelled) {
          setBootError('Không phát được âm thanh này. Bạn thử chọn âm thanh khác nhé.');
        }
      } catch (e) {
        if (!cancelled) {
          setBootError('Không lấy được source âm thanh cho phiên thiền.');
        }
        console.warn('Start meditation session failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      void cancel();
    };
  }, [cancel, duration, soundId, start]);

  const closeSession = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/tabs/tracker');
  }, []);

  const handleExit = useCallback(() => {
    if (session.status === 'playing' || session.status === 'paused') {
      if (session.status === 'playing') {
        void pause('user').finally(() => setExitDialogVisible(true));
        return;
      }

      setExitDialogVisible(true);
      return;
    }

    closeSession();
  }, [closeSession, pause, session.status]);

  const handleFinish = useCallback(async () => {
    setExitDialogVisible(false);
    dismissAwayDialog();
    const actualMin = await stopAndSave();
    await persistSession(actualMin);
    closeSession();
  }, [closeSession, dismissAwayDialog, persistSession, stopAndSave]);

  const handleDiscard = useCallback(async () => {
    setExitDialogVisible(false);
    dismissAwayDialog();
    await cancel();
    closeSession();
  }, [cancel, closeSession, dismissAwayDialog]);

  const handleResumeFromDialog = useCallback(() => {
    setExitDialogVisible(false);
    dismissAwayDialog();
    void resume();
  }, [dismissAwayDialog, resume]);

  const targetSec = session.targetSec || duration * 60;
  const remainingSec = Math.max(0, targetSec - session.elapsedSec);
  const progress = targetSec > 0 ? Math.min(1, session.elapsedSec / targetSec) : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const pendingSaveMin = Math.max(0, Math.round(session.elapsedSec / 60));
  const canSavePendingSession = pendingSaveMin >= 1 && saveState !== 'saving';
  const showSessionDialog = exitDialogVisible || session.showAwayDialog;

  useEffect(() => {
    if (session.status !== 'completed' || progress < 1 || completionAlertShownRef.current) return;
    completionAlertShownRef.current = true;
    Alert.alert(
      'Chúc mừng',
      'Bạn đã hoàn thành tốt thiền định hôm nay.'
    );
  }, [progress, session.status]);

  const saveText = useMemo(() => {
    if (saveState === 'saving') return 'Đang lưu phiên thiền...';
    if (saveState === 'saved') return 'Đã lưu phiên thiền';
    if (saveState === 'failed') return 'Chưa lưu được lên server';
    return '';
  }, [saveState]);

  const sessionText = useMemo(() => {
    if (session.status === 'completed') return 'Phiên thiền đã hoàn tất';
    if (session.status === 'paused') return 'Đang tạm dừng';
    if (session.status === 'playing') {
      if (session.elapsedSec >= BREATHING_GUIDE_SECONDS) return '';

      const breathCycleSecond = session.elapsedSec % 10;
      if (breathCycleSecond < 4) return 'Hít vào sâu...';
      if (breathCycleSecond < 6) return 'Giữ hơi thở thật nhẹ';
      return 'Thở ra chậm rãi';
    }
    return 'Chuẩn bị phiên thiền';
  }, [session.elapsedSec, session.status]);

  const dialogBody = useMemo(() => {
    const awayText = session.showAwayDialog
      ? `Bạn đã rời app ${session.awayDurationSec} giây. `
      : '';

    if (pendingSaveMin < 1) {
      return `${awayText}Phiên này chưa đủ 1 phút để lưu. Thoát không lưu sẽ giữ nguyên ${todayMeditationMin} phút thiền hôm nay.`;
    }

    if (todayMeditationMin > 0) {
      return `${awayText}Hôm nay bạn đã có ${todayMeditationMin} phút. Lưu phiên này sẽ cộng thêm ${pendingSaveMin} phút, thành ${todayMeditationMin + pendingSaveMin} phút. Thoát không lưu sẽ giữ nguyên thời gian cũ.`;
    }

    return `${awayText}Lưu phiên này để ghi nhận ${pendingSaveMin} phút thiền hôm nay. Thoát không lưu sẽ không ghi thêm thời gian.`;
  }, [pendingSaveMin, session.awayDurationSec, session.showAwayDialog, todayMeditationMin]);

  const renderWave = (value: Animated.Value) => (
    <Animated.View
      style={[
        s.waveRing,
        {
          opacity: value.interpolate({
            inputRange: [0, 0.35, 1],
            outputRange: [0.34, 0.2, 0],
          }),
          transform: [
            {
              scale: value.interpolate({
                inputRange: [0, 1],
                outputRange: [0.72, 1.48],
              }),
            },
          ],
        },
      ]}
    />
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <View style={s.screen}>
        <View style={s.header}>
          <TouchableOpacity style={s.iconButton} onPress={handleExit} activeOpacity={0.8}>
            <ChevronLeftLineIcon size={21} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>Phiên thiền</Text>
          <View style={s.placeholder} />
        </View>

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={s.loadingText}>Đang chuẩn bị âm thanh...</Text>
          </View>
        ) : bootError ? (
          <View style={s.content}>
            <View style={s.errorCard}>
              <Text style={s.errorTitle}>Chưa bắt đầu được</Text>
              <Text style={s.errorBody}>{bootError}</Text>
              <TouchableOpacity style={s.primaryButton} onPress={closeSession}>
                <Text style={s.primaryButtonText}>Quay lại chọn âm thanh</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={s.content}>
              <Text style={s.soundName} numberOfLines={1}>{sound?.name ?? 'Thiền'}</Text>
              <Text style={s.soundDesc} numberOfLines={2}>
                {sound?.description ?? 'Giữ nhịp thở đều và thả lỏng cơ thể.'}
              </Text>

              <View style={s.clockWrap}>
                {renderWave(waveA)}
                {renderWave(waveB)}
                {renderWave(waveC)}

                <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} style={s.progressSvg}>
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke="rgba(255,255,255,0.32)"
                    strokeWidth={10}
                    fill="transparent"
                  />
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke="#FFFFFF"
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                    strokeDashoffset={dashOffset}
                    fill="transparent"
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                </Svg>

                <View style={s.clockFace}>
                  <Text style={s.countdown}>{formatCountdown(remainingSec)}</Text>
                  <Text style={s.timerCaption}>{duration} phút</Text>
                </View>
              </View>

              <Text style={[s.statusText, !sessionText && s.statusTextHidden]}>{sessionText}</Text>
              <Text style={s.saveText}>{saveText}</Text>
            </View>

            <View style={s.actions}>
              {session.status === 'completed' ? (
                <TouchableOpacity style={s.primaryButton} onPress={closeSession}>
                  <Text style={s.primaryButtonText}>Hoàn tất</Text>
                </TouchableOpacity>
              ) : session.status === 'paused' ? (
                <>
                  <TouchableOpacity style={s.primaryButton} onPress={() => void resume()}>
                    <PlayLineIcon size={17} color="#143A25" />
                    <Text style={s.primaryButtonText}>Tiếp tục</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.secondaryButton} onPress={handleFinish}>
                    <Text style={s.secondaryButtonText}>Kết thúc & lưu</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={s.primaryButton} onPress={() => void pause('user')}>
                    <PauseLineIcon size={17} color="#143A25" />
                    <Text style={s.primaryButtonText}>Tạm dừng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.secondaryButton} onPress={handleFinish}>
                    <Text style={s.secondaryButtonText}>Kết thúc & lưu</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {showSessionDialog && (
              <View style={s.dialogBackdrop}>
                <View style={s.dialogCard}>
                  <Text style={s.dialogTitle}>
                    {session.showAwayDialog ? 'Phiên đã tạm dừng' : 'Lưu phiên trước khi thoát?'}
                  </Text>
                  <Text style={s.dialogBody}>{dialogBody}</Text>
                  <View style={s.dialogActions}>
                    <TouchableOpacity style={s.dialogPrimaryButton} onPress={handleResumeFromDialog}>
                      <Text style={s.dialogPrimaryButtonText}>Tiếp tục thiền</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        s.dialogSecondaryButton,
                        !canSavePendingSession && s.dialogButtonDisabled,
                      ]}
                      onPress={handleFinish}
                      disabled={!canSavePendingSession}
                    >
                      <Text style={s.dialogSecondaryButtonText}>
                        {pendingSaveMin >= 1
                          ? `Lưu +${pendingSaveMin} phút & thoát`
                          : 'Chưa đủ 1 phút để lưu'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.dialogDangerButton} onPress={handleDiscard}>
                      <Text style={s.dialogDangerButtonText}>Thoát không lưu</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
