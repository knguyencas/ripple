import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  PanResponder, Dimensions, StyleSheet, Platform
} from 'react-native';
import { moodWheelStyles as s } from '../../styles/mood-wheel.styles';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

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

const N = MOODS.length;
const WHEEL_SIZE = width * 0.88;
const RADIUS = WHEEL_SIZE / 2;
const INNER_R = WHEEL_SIZE * 0.18;
const TRACK_R = (RADIUS * 0.72 + INNER_R) / 2 + INNER_R * 0.3;
const ITEM_SIZE = 44;
const DEG_PER_ITEM = 360 / N;
const INITIAL_IDX = 5;

function makeWheelSVG(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 1;
  const r = INNER_R;

  const paths = MOODS.map((mood, i) => {
    const a1 = ((i * DEG_PER_ITEM) - 90) * Math.PI / 180;
    const a2 = (((i + 1) * DEG_PER_ITEM) - 90) * Math.PI / 180;
    const ox1 = cx + R * Math.cos(a1);
    const oy1 = cy + R * Math.sin(a1);
    const ox2 = cx + R * Math.cos(a2);
    const oy2 = cy + R * Math.sin(a2);
    const ix2 = cx + r * Math.cos(a2);
    const iy2 = cy + r * Math.sin(a2);
    const ix1 = cx + r * Math.cos(a1);
    const iy1 = cy + r * Math.sin(a1);
    const d = [
      `M${ox1.toFixed(2)},${oy1.toFixed(2)}`,
      `A${R},${R} 0 0,1 ${ox2.toFixed(2)},${oy2.toFixed(2)}`,
      `L${ix2.toFixed(2)},${iy2.toFixed(2)}`,
      `A${r},${r} 0 0,0 ${ix1.toFixed(2)},${iy1.toFixed(2)}`,
      'Z',
    ].join(' ');
    return `<path d="${d}" fill="${mood.color}" stroke="white" stroke-width="1.5"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${paths.join('')}</svg>`;
}

const SVG_HTML = makeWheelSVG(WHEEL_SIZE);
const SVG_URI = `data:image/svg+xml;utf8,${encodeURIComponent(SVG_HTML)}`;

interface Props {
  onConfirm: (mood: typeof MOODS[0]) => void;
  onClose: () => void;
}

export default function MoodWheel({ onConfirm, onClose }: Props) {
  const [currentIdx, setCurrentIdx] = useState(INITIAL_IDX);
  const initDeg = -((INITIAL_IDX + 0.5) * DEG_PER_ITEM);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const wheelRotation = useRef(new Animated.Value(initDeg)).current;
  const currentDeg = useRef(initDeg);
  const lastX = useRef(0);

  useState(() => {
    Animated.spring(slideAnim, {
      toValue: 0, tension: 60, friction: 12, useNativeDriver: false,
    }).start();
  });

  const getIdxFromDeg = (deg: number) => {
    const normalized = ((-deg) % 360 + 360) % 360;
    return Math.floor(normalized / DEG_PER_ITEM) % N;
  };

  const snapToIdx = (idx: number) => {
    const target = -((idx + 0.5) * DEG_PER_ITEM);
    const current = currentDeg.current;
    let diff = target - (current % 360);
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const snapped = current + diff;
    currentDeg.current = snapped;
    Animated.spring(wheelRotation, {
      toValue: snapped, tension: 80, friction: 10, useNativeDriver: false,
    }).start();
    setCurrentIdx(idx);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { lastX.current = e.nativeEvent.pageX; },
    onPanResponderMove: (e) => {
      const dx = e.nativeEvent.pageX - lastX.current;
      lastX.current = e.nativeEvent.pageX;
      currentDeg.current += dx * 0.4;
      wheelRotation.setValue(currentDeg.current);
      setCurrentIdx(getIdxFromDeg(currentDeg.current));
    },
    onPanResponderRelease: () => snapToIdx(currentIdx),
  });

  const handleConfirm = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: false })
      .start(() => onConfirm(MOODS[currentIdx]));
  };

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: false })
      .start(onClose);
  };

  const rotateDeg = wheelRotation.interpolate({
    inputRange: [-10000, 10000],
    outputRange: ['-10000deg', '10000deg'],
  });

  const WheelBackground = () => {
    if (Platform.OS === 'web') {
      const Div = 'div' as any;
      return (
        <Div
          style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
          dangerouslySetInnerHTML={{ __html: SVG_HTML }}
        />
      );
    }
    const ImgTag = 'img' as any;
    return (
      <ImgTag
        src={SVG_URI}
        style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
      />
    );
  };

  return (
    <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={handleClose}>
      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity activeOpacity={1} style={{ width: '100%', alignItems: 'center' }}>
          <View style={s.handle} />
          <Text style={s.moodEmojiBig}>{MOODS[currentIdx].emoji}</Text>
          <Text style={s.moodName}>{MOODS[currentIdx].name}</Text>
          <Text style={s.moodDesc}>{MOODS[currentIdx].desc}</Text>

          <View style={ls.wheelClip} {...panResponder.panHandlers}>
            <Animated.View style={[ls.wheelInner, { transform: [{ rotate: rotateDeg }] }]}>

              <WheelBackground />

              {MOODS.map((mood, i) => {
                const centerDeg = (i + 0.5) * DEG_PER_ITEM;
                const centerRad = (centerDeg * Math.PI) / 180;
                const cx = RADIUS + Math.sin(centerRad) * TRACK_R - ITEM_SIZE / 2;
                const cy = RADIUS - Math.cos(centerRad) * TRACK_R - ITEM_SIZE / 2;
                const isActive = i === currentIdx;
                const dist = Math.min(Math.abs(i - currentIdx), N - Math.abs(i - currentIdx));
                const opacity = isActive ? 1 : Math.max(0.45, 1 - dist * 0.12);

                return (
                  <Animated.View
                    key={i}
                    style={{
                      position: 'absolute',
                      left: cx, top: cy,
                      width: ITEM_SIZE, height: ITEM_SIZE,
                      alignItems: 'center', justifyContent: 'center',
                      opacity,
                      transform: [
                        { rotate: rotateDeg },
                        { rotate: `-${centerDeg}deg` },
                        { scale: isActive ? 1.25 : 0.85 },
                      ],
                    }}
                  >
                    <Text style={{ fontSize: isActive ? 28 : 18 }}>
                      {mood.emoji}
                    </Text>
                  </Animated.View>
                );
              })}

              <View style={ls.centerHole} />
            </Animated.View>

            <View style={ls.needleWrap} pointerEvents="none">
              <View style={ls.needleLine} />
              <View style={ls.needleTip} />
              <View style={ls.needleCenter} />
            </View>
          </View>

          <Text style={s.hint}>← Kéo để chọn tâm trạng →</Text>

          <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
            <Text style={s.confirmBtnText}>Xác nhận 👍</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.skipBtn} onPress={handleClose}>
            <Text style={s.skipText}>Bỏ qua hôm nay</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
}

const CLIP_H = WHEEL_SIZE / 2 + 20;

const ls = StyleSheet.create({
  wheelClip: {
    width: WHEEL_SIZE,
    height: CLIP_H,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelInner: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    position: 'absolute',
    top: 0, left: 0,
  },
  centerHole: {
    position: 'absolute',
    width: INNER_R * 2,
    height: INNER_R * 2,
    borderRadius: INNER_R,
    backgroundColor: '#F5FBFD',
    top: RADIUS - INNER_R,
    left: RADIUS - INNER_R,
  },
  needleWrap: {
    position: 'absolute',
    top: 0, left: 0,
    width: WHEEL_SIZE,
    height: CLIP_H,
  },
  needleLine: {
    position: 'absolute',
    width: 3,
    height: RADIUS - INNER_R - 6,
    backgroundColor: '#1A3A5C',
    top: INNER_R + 4,
    left: WHEEL_SIZE / 2 - 1.5,
    borderRadius: 2,
  },
  needleTip: {
    position: 'absolute',
    top: INNER_R - 4,
    left: WHEEL_SIZE / 2 - 6,
    width: 0, height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1A3A5C',
  },
  needleCenter: {
    position: 'absolute',
    width: 14, height: 14,
    borderRadius: 7,
    backgroundColor: '#1A3A5C',
    top: RADIUS - 7,
    left: WHEEL_SIZE / 2 - 7,
  },
});