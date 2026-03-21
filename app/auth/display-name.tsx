import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Animated, FlatList, NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import { router } from 'expo-router';
import { displayNameStyles as s } from '../../styles/display-name.styles';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';

const ITEM_HEIGHT = 56;
const AGES = Array.from({ length: 91 }, (_, i) => i + 10);
const DEFAULT_AGE = 18;
const DEFAULT_INDEX = DEFAULT_AGE - 10;

export default function DisplayNameScreen() {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [selectedAge, setSelectedAge] = useState(DEFAULT_AGE);
  const [showManual, setShowManual] = useState(false);
  const [manualAge, setManualAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickerReady, setPickerReady] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);
  const lastTap = useRef(0);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (pickerReady && step === 2) {
      listRef.current?.scrollToIndex({
        index: DEFAULT_INDEX,
        animated: false,
        viewPosition: 0.5,
      });
    }
  }, [pickerReady, step]);

  const animateNext = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: false }),
    ]).start(() => {
      setStep(nextStep);
      setPickerReady(false);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();
    });
  };

  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, AGES.length - 1));
    setSelectedAge(AGES[clamped]);
  }, []);

  const handleTapAge = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setShowManual(true);
      setManualAge(String(selectedAge));
    }
    lastTap.current = now;
  };

  const handleDone = async () => {
    const finalAge = showManual ? manualAge : String(selectedAge);
    if (!finalAge) { setError('Vui lòng chọn độ tuổi'); return; }
    setLoading(true);
    setError('');
    try {
      await api.put('/users/me',
        { displayName: displayName || undefined, ageGroup: finalAge },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.replace('/tabs/home');
    } catch {
      router.replace('/tabs/home');
    } finally {
      setLoading(false);
    }
  };

  const Dots = () => (
    <View style={s.dots}>
      {[0, 1, 2].map(i => (
        <View key={i} style={[s.dot, step === i && s.dotActive]} />
      ))}
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.wave1} />
      <View style={s.wave2} />
      <Dots />

      <Animated.View style={[s.content, {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }]}>

        {step === 0 && (
          <View style={s.stepWrap}>
            <Text style={s.bigEmoji}>🌊</Text>
            <Text style={s.title}>Chào mừng đến với Ripple</Text>
            <Text style={s.subtitle}>
              Nơi bạn ghi lại cảm xúc,{'\n'}hiểu bản thân hơn mỗi ngày.
            </Text>
            <Text style={s.hint}>Cho mình biết thêm một chút về bạn nhé ✨</Text>
            <TouchableOpacity style={s.btnPrimary} onPress={() => animateNext(1)}>
              <Text style={s.btnText}>Bắt đầu nào →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={s.stepWrap}>
            <Text style={s.bigEmoji}>👋</Text>
            <Text style={s.title}>Bạn muốn được gọi là gì?</Text>
            <Text style={s.subtitle}>
              Tên hiển thị có thể là bất cứ thứ gì bạn thích
            </Text>
            <TextInput
              style={s.input}
              placeholder={user?.username || 'Nhập tên của bạn...'}
              placeholderTextColor="#9BB5C4"
              value={displayName}
              onChangeText={setDisplayName}
              autoFocus
            />
            {displayName ? (
              <Text style={s.preview}>Xin chào, {displayName} 👋</Text>
            ) : null}
            <TouchableOpacity style={s.btnPrimary} onPress={() => animateNext(2)}>
              <Text style={s.btnText}>Tiếp theo →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => animateNext(2)} style={s.btnSkip}>
              <Text style={s.skipText}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={s.stepWrap}>
            <Text style={s.bigEmoji}>🎂</Text>
            <Text style={s.title}>Bạn bao nhiêu tuổi?</Text>
            <Text style={s.subtitle}>
              Giúp tôi hiểu bạn hơn{'\n'}và cá nhân hóa trải nghiệm.
            </Text>

            {showManual ? (
              <TextInput
                style={s.manualInput}
                value={manualAge}
                onChangeText={setManualAge}
                keyboardType="numeric"
                autoFocus
                maxLength={3}
                onBlur={() => {
                  const parsed = parseInt(manualAge);
                  if (!isNaN(parsed) && parsed >= 10 && parsed <= 100) {
                    setSelectedAge(parsed);
                  }
                  setShowManual(false);
                }}
              />
            ) : (
              <TouchableOpacity activeOpacity={1} onPress={handleTapAge}>
                <View style={s.pickerWrap}>
                  <View style={[s.pickerOverlayTop, { pointerEvents: 'none' } as any]} />
                  <View style={[s.pickerOverlayBottom, { pointerEvents: 'none' } as any]} />
                  <View style={[s.pickerSelector, { pointerEvents: 'none' } as any]} />
                  <FlatList
                    ref={listRef}
                    data={AGES}
                    keyExtractor={(item) => String(item)}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={onScrollEnd}
                    onScrollEndDrag={onScrollEnd}
                    onLayout={() => setPickerReady(true)}
                    getItemLayout={(_, index) => ({
                      length: ITEM_HEIGHT,
                      offset: ITEM_HEIGHT * index,
                      index,
                    })}
                    ListHeaderComponent={<View style={{ height: ITEM_HEIGHT * 1.5 }} />}
                    ListFooterComponent={<View style={{ height: ITEM_HEIGHT * 1.5 }} />}
                    renderItem={({ item }) => (
                      <View style={s.pickerItem}>
                        <Text style={[
                          s.pickerItemText,
                          item === selectedAge && s.pickerItemTextActive
                        ]}>
                          {item}
                        </Text>
                      </View>
                    )}
                  />
                </View>
              </TouchableOpacity>
            )}

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.btnPrimary, loading && s.btnDisabled]}
              onPress={handleDone}
              disabled={loading}
            >
              <Text style={s.btnText}>
                {loading ? 'Đang lưu...' : 'Hoàn tất 🎉'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>
    </View>
  );
}