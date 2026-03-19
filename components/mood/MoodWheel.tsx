import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  PanResponder, Dimensions, StyleSheet
} from 'react-native';
import { moodWheelStyles as s } from '../../styles/mood-wheel.styles';

const { width } = Dimensions.get('window');

export const MOODS = [
  { emoji: '😶‍🌫️', name: 'Tê liệt',    desc: 'Mất cảm xúc, không còn cảm nhận', score: 1, color: '#0D1B4B' },
  { emoji: '😞',    name: 'Trầm cảm',  desc: 'Trống rỗng, vô vọng, kiệt sức',   score: 1, color: '#1B3A6B' },
  { emoji: '😢',    name: 'Buồn bã',   desc: 'Nặng nề, khó chịu trong lòng',    score: 2, color: '#1F4E8C' },
  { emoji: '😰',    name: 'Lo âu',     desc: 'Căng thẳng, bất an, bồn chồn',    score: 2, color: '#2E6DA4' },
  { emoji: '😤',    name: 'Cáu kỉnh',  desc: 'Dễ bực bội, mất kiên nhẫn',      score: 2, color: '#4A86B8' },
  { emoji: '😐',    name: 'Thờ ơ',     desc: 'Không cảm thấy gì đặc biệt',     score: 3, color: '#6AAED6' },
  { emoji: '😌',    name: 'Bình tĩnh', desc: 'Ổn định, cân bằng trong lòng',    score: 3, color: '#89C4E1' },
  { emoji: '🙂',    name: 'Ổn',        desc: 'Cảm thấy tương đối tốt',          score: 4, color: '#A8D5EC' },
  { emoji: '😊',    name: 'Tích cực',  desc: 'Nhẹ nhàng, có năng lượng',        score: 4, color: '#B8DFF2' },
  { emoji: '😄',    name: 'Vui vẻ',    desc: 'Cảm thấy tốt, hứng khởi',        score: 5, color: '#CAE8F5' },
  { emoji: '🤩',    name: 'Phấn khởi', desc: 'Tràn đầy năng lượng và niềm vui', score: 5, color: '#DCEEFA' },
];

const N = MOODS.length;
const WHEEL_SIZE = width * 0.88;
const RADIUS = WHEEL_SIZE / 2;
const ITEM_RADIUS = RADIUS * 0.65;
const ITEM_SIZE = 48;
const DEG_PER_ITEM = 360 / N;
const INITIAL_IDX = 5;
const P = -RADIUS / 2;

const INIT_DEG = -((INITIAL_IDX + 0.5) * DEG_PER_ITEM);

interface Props {
  onConfirm: (mood: typeof MOODS[0]) => void;
  onClose: () => void;
}

export default function MoodWheel({ onConfirm, onClose }: Props) {
  const [currentIdx, setCurrentIdx] = useState(INITIAL_IDX);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const wheelRotation = useRef(new Animated.Value(INIT_DEG)).current;
  const currentDeg = useRef(INIT_DEG);
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

  return (
    <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={handleClose}>
      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity activeOpacity={1} style={{ width: '100%', alignItems: 'center' }}>
          <View style={s.handle} />
          <Text style={s.moodEmojiBig}>{MOODS[currentIdx].emoji}</Text>
          <Text style={s.moodName}>{MOODS[currentIdx].name}</Text>
          <Text style={s.moodDesc}>{MOODS[currentIdx].desc}</Text>

          <View style={ls.arrowWrap}>
            <View style={ls.arrow} />
          </View>

          <View style={ls.wheelClip} {...panResponder.panHandlers}>
            <Animated.View style={[ls.wheel, { transform: [{ rotate: rotateDeg }] }]}>

              {MOODS.map((mood, i) => {
                const startDeg = i * DEG_PER_ITEM - 90;
                return (
                  <View
                    key={`seg-${i}`}
                    style={{
                      position: 'absolute',
                      left: RADIUS, top: 0,
                      width: RADIUS, height: WHEEL_SIZE,
                      overflow: 'hidden',
                      transform: [
                        { translateX: P },
                        { rotate: `${startDeg}deg` },
                        { translateX: -P },
                      ],
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        left: 0, top: 0,
                        width: RADIUS, height: WHEEL_SIZE,
                        backgroundColor: mood.color,
                        transform: [
                          { translateX: P },
                          { rotate: `${DEG_PER_ITEM}deg` },
                          { translateX: -P },
                        ],
                      }}
                    />
                  </View>
                );
              })}

              {MOODS.map((mood, i) => {
                const centerDeg = (i + 0.5) * DEG_PER_ITEM;
                const centerRad = (centerDeg * Math.PI) / 180;
                const cx = RADIUS + Math.sin(centerRad) * ITEM_RADIUS - ITEM_SIZE / 2;
                const cy = RADIUS - Math.cos(centerRad) * ITEM_RADIUS - ITEM_SIZE / 2;
                const isActive = i === currentIdx;
                const dist = Math.min(
                  Math.abs(i - currentIdx),
                  N - Math.abs(i - currentIdx)
                );
                const opacity = isActive ? 1 : Math.max(0.4, 1 - dist * 0.12);

                return (
                  <Animated.View
                    key={`emoji-${i}`}
                    style={{
                      position: 'absolute',
                      left: cx, top: cy,
                      width: ITEM_SIZE, height: ITEM_SIZE,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity,
                      transform: [
                        { rotate: rotateDeg },
                        { rotate: `-${centerDeg}deg` },
                        { scale: isActive ? 1.3 : 0.85 },
                      ],
                    }}
                  >
                    <Text style={{ fontSize: isActive ? 30 : 20 }}>
                      {mood.emoji}
                    </Text>
                  </Animated.View>
                );
              })}

              <View style={ls.centerHole} />
              <View style={ls.indicator} />
            </Animated.View>
          </View>

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

const ls = StyleSheet.create({
  arrowWrap: {
    alignItems: 'center',
    marginBottom: 2,
  },
  arrow: {
    width: 0, height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1565C0',
  },
  wheelClip: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE / 2 + 20,
    overflow: 'hidden',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#B8DFF2',
  },
  centerHole: {
    position: 'absolute',
    width: WHEEL_SIZE * 0.34,
    height: WHEEL_SIZE * 0.34,
    borderRadius: WHEEL_SIZE * 0.17,
    backgroundColor: '#F5FBFD',
    top: WHEEL_SIZE / 2 - WHEEL_SIZE * 0.17,
    left: WHEEL_SIZE / 2 - WHEEL_SIZE * 0.17,
  },
  indicator: {
    position: 'absolute',
    width: 12, height: 18,
    borderRadius: 6,
    backgroundColor: '#1A3A5C',
    top: WHEEL_SIZE / 2 - WHEEL_SIZE * 0.17 - 14,
    left: WHEEL_SIZE / 2 - 6,
  },
});