import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  PanResponder, Platform,
  GestureResponderEvent, Modal
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import {
  moodWheelStyles as s,
  wheelStyles as ls,
  moodWheelElementStyles as es,
  MOOD_WHEEL_SIZE,
  MOOD_WHEEL_RADIUS,
  MOOD_WHEEL_INNER_RADIUS,
  MOOD_WHEEL_CLIP_HEIGHT,
} from '../../styles/mood/mood-wheel.styles';
import { Colors } from '../../constants/colors';
import {
  buildEmojiPositions,
  getSnappedDegree,
  getWheelIndexFromDegree,
} from '../../utils/mood/mood-wheel.utils';
import { SoraMoodIcon, type SoraMoodExpression } from '../shared/Sora';

export const MOODS = [
  { emoji: '😶‍🌫️', name: 'Tê liệt',    desc: 'Mất cảm xúc, không còn cảm nhận', score: 1, color: Colors.moodScale[0] },
  { emoji: '😶',    name: 'Mơ hồ',     desc: 'Cảm giác trống rỗng, mơ hồ',      score: 1, color: Colors.moodScale[1] },
  { emoji: '😢',    name: 'Buồn bã',   desc: 'Nặng nề, khó chịu trong lòng',    score: 2, color: Colors.moodScale[2] },
  { emoji: '😔',    name: 'Mệt mỏi',   desc: 'Kiệt sức, thiếu năng lượng',      score: 2, color: Colors.moodScale[3] },
  { emoji: '😤',    name: 'Cáu kỉnh',  desc: 'Dễ bực bội, mất kiên nhẫn',      score: 2, color: Colors.moodScale[4] },
  { emoji: '😐',    name: 'Thờ ơ',     desc: 'Không cảm thấy gì đặc biệt',     score: 3, color: Colors.moodScale[5] },
  { emoji: '😌',    name: 'Bình tĩnh', desc: 'Ổn định, cân bằng trong lòng',    score: 3, color: Colors.moodScale[6] },
  { emoji: '🙂',    name: 'Ổn',        desc: 'Cảm thấy tương đối tốt',          score: 4, color: Colors.moodScale[7] },
  { emoji: '😊',    name: 'Tích cực',  desc: 'Nhẹ nhàng, có năng lượng',        score: 4, color: Colors.moodScale[8] },
  { emoji: '😄',    name: 'Vui vẻ',    desc: 'Cảm thấy tốt, hứng khởi',        score: 5, color: Colors.moodScale[9] },
  { emoji: '🤩',    name: 'Phấn khởi', desc: 'Tràn đầy năng lượng và niềm vui', score: 5, color: Colors.moodScale[10] },
];

const N            = MOODS.length;
const TRACK_R      = (MOOD_WHEEL_RADIUS + MOOD_WHEEL_INNER_RADIUS) / 2;
const ITEM_SIZE    = 46;
const DEG_PER_ITEM = 360 / N;
const INITIAL_IDX  = 5;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';
export const SORA_MOOD_EXPRESSIONS: SoraMoodExpression[] = [
  'numb',
  'vague',
  'sad',
  'tired',
  'angry',
  'neutral',
  'calm',
  'okay',
  'positive',
  'happy',
  'excited',
];

function normalizeMoodIndex(index: number): number {
  if (!Number.isFinite(index)) return INITIAL_IDX;
  return ((Math.round(index) % N) + N) % N;
}

function getGestureX(e: GestureResponderEvent): number | null {
  const event = e.nativeEvent as GestureResponderEvent['nativeEvent'] & {
    clientX?: number;
  };
  const x = event.pageX ?? event.locationX ?? event.clientX;
  return Number.isFinite(x) ? x : null;
}

function polarPoint(cx: number, cy: number, radius: number, degree: number) {
  const rad = (degree * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function makeDonutSegmentPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startDegree: number,
  endDegree: number
): string {
  const outerStart = polarPoint(cx, cy, outerRadius, startDegree);
  const outerEnd = polarPoint(cx, cy, outerRadius, endDegree);
  const innerEnd = polarPoint(cx, cy, innerRadius, endDegree);
  const innerStart = polarPoint(cx, cy, innerRadius, startDegree);
  const largeArc = Math.abs(endDegree - startDegree) > 180 ? 1 : 0;

  return [
    `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `A ${outerRadius.toFixed(2)} ${outerRadius.toFixed(2)} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    `A ${innerRadius.toFixed(2)} ${innerRadius.toFixed(2)} 0 ${largeArc} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

const WHEEL_CENTER = MOOD_WHEEL_SIZE / 2;
const WHEEL_OUTER_RADIUS = MOOD_WHEEL_RADIUS - 1;
const INNER_RING_WIDTH = 13;
const WHEEL_SEGMENTS = MOODS.map((mood, i) => {
  const start = i * DEG_PER_ITEM - 90;
  const end = (i + 1) * DEG_PER_ITEM - 90;
  return {
    color: mood.color,
    d: makeDonutSegmentPath(
      WHEEL_CENTER,
      WHEEL_CENTER,
      WHEEL_OUTER_RADIUS,
      MOOD_WHEEL_INNER_RADIUS,
      start,
      end
    ),
    innerRingD: makeDonutSegmentPath(
      WHEEL_CENTER,
      WHEEL_CENTER,
      MOOD_WHEEL_INNER_RADIUS + INNER_RING_WIDTH,
      MOOD_WHEEL_INNER_RADIUS,
      start,
      end
    ),
  };
});

const NEEDLE_CENTER_X = MOOD_WHEEL_SIZE / 2;
const NEEDLE_CENTER_Y = MOOD_WHEEL_RADIUS;
const NEEDLE_TIP_Y = MOOD_WHEEL_RADIUS - MOOD_WHEEL_INNER_RADIUS;
const NEEDLE_COLOR = '#8A540F';
const WHEEL_COLOR_BOOST = [
  '#4F6F7C',
  '#6F7ED8',
  '#58A8E8',
  '#C27ADE',
  '#F08080',
  '#A5B4BC',
  '#66BFB7',
  '#8BD08D',
  '#B8DC8C',
  '#FFB95D',
  '#F071A7',
];

function WheelBackground({ activeIndex }: { activeIndex: number }) {
  return (
    <Svg
      width={MOOD_WHEEL_SIZE}
      height={MOOD_WHEEL_SIZE}
      viewBox={`0 0 ${MOOD_WHEEL_SIZE} ${MOOD_WHEEL_SIZE}`}
      style={es.wheelBackground}
    >
      {WHEEL_SEGMENTS.map((segment, i) => (
        <Path
          key={`segment-${i}`}
          d={segment.d}
          fill={WHEEL_COLOR_BOOST[i] ?? segment.color}
          stroke="#F4F8FB"
          strokeWidth={1.2}
          opacity={i === activeIndex ? 1 : 0.72}
        />
      ))}
      {WHEEL_SEGMENTS.map((segment, i) => (
        <Path
          key={`inner-ring-${i}`}
          d={segment.innerRingD}
          fill="#1A3A5C"
          opacity={i === activeIndex ? 0.3 : 0.14}
        />
      ))}
      {WHEEL_SEGMENTS.map((segment, i) => (
        i === activeIndex ? (
          <Path
            key={`active-highlight-${i}`}
            d={segment.d}
            fill="rgba(255,255,255,0.16)"
            stroke="#FFFFFF"
            strokeWidth={3}
          />
        ) : null
      ))}
      {WHEEL_SEGMENTS.map((segment, i) => (
        i === activeIndex ? (
          <Path
            key={`active-inner-${i}`}
            d={segment.innerRingD}
            fill="#FFFFFF"
            opacity={0.18}
          />
        ) : null
      ))}
      {WHEEL_SEGMENTS.map((segment, i) => (
        i === activeIndex ? (
          <Path
            key={`active-core-${i}`}
            d={segment.d}
            fill="none"
            stroke="#1A3A5C"
            strokeWidth={1.2}
            opacity={0.22}
          />
        ) : null
      ))}
    </Svg>
  );
}

function MoodWheelFace({
  expression,
  active,
}: {
  expression: SoraMoodExpression;
  active: boolean;
}) {
  const color = active ? '#1A3A5C' : '#365E72';
  const opacity = active ? 0.9 : 0.62;

  if (expression === 'angry') {
    return (
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Path d="M11 15l6 5M29 15l-6 5M12 25l5-5M28 25l-5-5" stroke={color} strokeWidth={3.1} strokeLinecap="round" opacity={opacity} />
      </Svg>
    );
  }

  if (expression === 'sad' || expression === 'tired') {
    return (
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Path d="M11 17c4 3 7 3 10 0M24 17c4 3 7 3 10 0" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" opacity={opacity} />
        <Path d="M15 28c3-5 10-5 13 0" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" opacity={opacity} />
      </Svg>
    );
  }

  if (expression === 'neutral' || expression === 'numb') {
    return (
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Line x1={14} y1={14} x2={14} y2={22} stroke={color} strokeWidth={3.2} strokeLinecap="round" opacity={opacity} />
        <Line x1={26} y1={14} x2={26} y2={22} stroke={color} strokeWidth={3.2} strokeLinecap="round" opacity={opacity} />
        <Line x1={13} y1={28} x2={27} y2={28} stroke={color} strokeWidth={3.2} strokeLinecap="round" opacity={opacity} />
      </Svg>
    );
  }

  if (expression === 'vague') {
    return (
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Path d="M10 17c4 2 8 1 10-3M24 24c3-5 8-6 12-2" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" opacity={opacity} />
        <Path d="M12 28c4-4 11-4 15 0" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" opacity={opacity} />
      </Svg>
    );
  }

  if (expression === 'excited') {
    return (
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Path d="M10 20l4-6 4 6M22 20l4-6 4 6" stroke={color} strokeWidth={3.1} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={opacity} />
        <Path d="M13 25c4 6 14 6 18 0" stroke={color} strokeWidth={3.2} strokeLinecap="round" fill="none" opacity={opacity} />
      </Svg>
    );
  }

  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M11 17c4 3 7 3 10 0M24 17c4 3 7 3 10 0" stroke={color} strokeWidth={3.1} strokeLinecap="round" fill="none" opacity={opacity} />
      <Path d="M13 25c4 6 14 6 18 0" stroke={color} strokeWidth={3.1} strokeLinecap="round" fill="none" opacity={opacity} />
    </Svg>
  );
}

function MoodNeedle() {
  return (
    <Svg
      width={MOOD_WHEEL_SIZE}
      height={MOOD_WHEEL_CLIP_HEIGHT}
      viewBox={`0 0 ${MOOD_WHEEL_SIZE} ${MOOD_WHEEL_CLIP_HEIGHT}`}
      style={ls.needleSvg}
    >
      <Path
        d={[
          `M ${NEEDLE_CENTER_X} ${NEEDLE_TIP_Y + 2}`,
          `C ${NEEDLE_CENTER_X + 13} ${NEEDLE_TIP_Y + 23}`,
          `${NEEDLE_CENTER_X + 28} ${NEEDLE_CENTER_Y - 2}`,
          `${NEEDLE_CENTER_X + 25} ${NEEDLE_CENTER_Y + 22}`,
          `C ${NEEDLE_CENTER_X + 22} ${NEEDLE_CENTER_Y + 52}`,
          `${NEEDLE_CENTER_X + 8} ${NEEDLE_CENTER_Y + 65}`,
          `${NEEDLE_CENTER_X} ${NEEDLE_CENTER_Y + 65}`,
          `C ${NEEDLE_CENTER_X - 8} ${NEEDLE_CENTER_Y + 65}`,
          `${NEEDLE_CENTER_X - 22} ${NEEDLE_CENTER_Y + 52}`,
          `${NEEDLE_CENTER_X - 25} ${NEEDLE_CENTER_Y + 22}`,
          `C ${NEEDLE_CENTER_X - 28} ${NEEDLE_CENTER_Y - 2}`,
          `${NEEDLE_CENTER_X - 13} ${NEEDLE_TIP_Y + 23}`,
          `${NEEDLE_CENTER_X} ${NEEDLE_TIP_Y + 2}`,
          'Z',
        ].join(' ')}
        fill={NEEDLE_COLOR}
      />
      <Circle
        cx={NEEDLE_CENTER_X}
        cy={NEEDLE_CENTER_Y + 21}
        r={11}
        fill="#FFFFFF"
      />
    </Svg>
  );
}

interface Props {
  onConfirm: (mood: typeof MOODS[0]) => void;
  onClose:   () => void;
}

export default function MoodWheel({ onConfirm, onClose }: Props) {
  const [currentIdx, setCurrentIdx] = useState(INITIAL_IDX);

  const initDeg      = -((INITIAL_IDX + 0.5) * DEG_PER_ITEM);
  const slideAnim    = useRef(new Animated.Value(400)).current;
  const wheelRotation = useRef(new Animated.Value(initDeg)).current;
  const currentDeg   = useRef(initDeg);
  const lastX        = useRef(0);
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0, tension: 60, friction: 12, useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, []);

  const rotateDeg = useMemo(() =>
    wheelRotation.interpolate({
      inputRange:  [-10000, 10000],
      outputRange: ['-10000deg', '10000deg'],
    }), []);

  const negRotateDeg = useMemo(() =>
    wheelRotation.interpolate({
      inputRange:  [-10000, 10000],
      outputRange: ['10000deg', '-10000deg'],
    }), []);

  const emojiPositions = useMemo(
    () => buildEmojiPositions(N, DEG_PER_ITEM, MOOD_WHEEL_RADIUS, TRACK_R, ITEM_SIZE),
    []
  );

  const snapToIdx = (idx: number) => {
    const safeIdx = normalizeMoodIndex(idx);
    const safeCurrentDeg = Number.isFinite(currentDeg.current) ? currentDeg.current : initDeg;
    const snapped = getSnappedDegree(safeCurrentDeg, safeIdx, DEG_PER_ITEM);
    currentDeg.current = snapped;
    Animated.spring(wheelRotation, {
      toValue: snapped, tension: 80, friction: 10, useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
    setCurrentIdx(safeIdx);
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: (e: GestureResponderEvent) => {
      wheelRotation.stopAnimation((value) => {
        if (Number.isFinite(value)) currentDeg.current = value;
      });
      const x = getGestureX(e);
      if (x == null) return;
      lastX.current = x;
    },
    onPanResponderMove: (e: GestureResponderEvent) => {
      const x = getGestureX(e);
      if (x == null) return;
      const dx = x - lastX.current;
      lastX.current = x;
      if (!Number.isFinite(dx)) return;
      const nextDeg = (Number.isFinite(currentDeg.current) ? currentDeg.current : initDeg) + dx * 0.4;
      if (!Number.isFinite(nextDeg)) return;
      currentDeg.current = nextDeg;
      wheelRotation.setValue(nextDeg);
      setCurrentIdx(normalizeMoodIndex(getWheelIndexFromDegree(nextDeg, DEG_PER_ITEM, N)));
    },
    onPanResponderRelease: () => snapToIdx(currentIdx),
  }), [currentIdx]);

  const safeCurrentIdx = normalizeMoodIndex(currentIdx);
  const currentMood = MOODS[safeCurrentIdx] ?? MOODS[INITIAL_IDX];

  const handleConfirm = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: USE_NATIVE_DRIVER })
      .start(() => onConfirm(currentMood));
  };

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: USE_NATIVE_DRIVER })
      .start(onClose);
  };

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={handleClose}>
        <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity activeOpacity={1} style={es.sheetBody}>

            <View style={s.handle} />
            <View style={s.moodSoraBig}>
              <SoraMoodIcon
                size={76}
                expression={SORA_MOOD_EXPRESSIONS[safeCurrentIdx] ?? 'neutral'}
              />
            </View>
            <Text style={s.moodName}>{currentMood.name}</Text>
            <Text style={s.moodDesc}>{currentMood.desc}</Text>

            <View style={ls.wheelClip} {...panResponder.panHandlers}>
              <Animated.View style={[ls.wheelInner, { transform: [{ rotate: rotateDeg }] }]}>

                <WheelBackground activeIndex={safeCurrentIdx} />

                {MOODS.map((mood, i) => {
                  const { left, top } = emojiPositions[i];
                  const isActive   = i === safeCurrentIdx;
                  const dist       = Math.min(
                    Math.abs(i - safeCurrentIdx),
                    N - Math.abs(i - safeCurrentIdx)
                  );
                  const opacity = isActive ? 1 : Math.max(0.45, 1 - dist * 0.12);

                  return (
                    <Animated.View
                      key={i}
                      style={[
                        es.emojiItemBase,
                        {
                          left,
                          top,
                          width: ITEM_SIZE,
                          height: ITEM_SIZE,
                          opacity,
                          transform: [
                            { rotate: negRotateDeg },
                            { scale: isActive ? 1.25 : 0.85 },
                          ],
                        },
                      ]}
                    >
                      <MoodWheelFace
                        expression={SORA_MOOD_EXPRESSIONS[i] ?? 'neutral'}
                        active={isActive}
                      />
                    </Animated.View>
                  );
                })}

                <View style={ls.centerHole} />
              </Animated.View>

              <View style={ls.needleWrap} pointerEvents="none">
                <MoodNeedle />
              </View>
            </View>

            <Text style={s.hint}>← Kéo để chọn tâm trạng →</Text>

            <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
              <Text style={s.confirmBtnText}>Xác nhận</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.skipBtn} onPress={handleClose}>
              <Text style={s.skipText}>Bỏ qua hôm nay</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}
