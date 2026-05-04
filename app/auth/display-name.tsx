import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Animated, FlatList, NativeScrollEvent,
  NativeSyntheticEvent, Modal
} from 'react-native';
import { router } from 'expo-router';
import { displayNameStyles as s } from '../../styles/auth/display-name.styles';
import api from '../../services/core/api';
import { useAuthStore } from '../../stores/auth.store';
import AuthBackdrop from '../../components/auth/AuthBackdrop';
import Button from '../../components/shared/Button';
import { normalizeAgeGroup } from '../../utils/profile/age-group.utils';

const ITEM_HEIGHT = 46;
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedName, setSavedName] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);
  const lastTap = useRef(0);
  const { user, token, updateUser } = useAuthStore();

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

  const updateAgeFromOffset = useCallback((offsetY: number) => {
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, AGES.length - 1));
    setSelectedAge(AGES[clamped]);
  }, []);

  const onScrollAge = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateAgeFromOffset(e.nativeEvent.contentOffset.y);
  }, [updateAgeFromOffset]);

  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateAgeFromOffset(e.nativeEvent.contentOffset.y);
  }, [updateAgeFromOffset]);

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
    const finalAgeGroup = normalizeAgeGroup(finalAge);
    if (!finalAgeGroup) { setError('Vui lòng chọn độ tuổi'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/users/me',
        { displayName: displayName.trim() || null, ageGroup: finalAgeGroup },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await updateUser({
        displayName: res.data?.displayName ?? null,
        ageGroup: res.data?.ageGroup ?? null,
      });
      setSavedName(res.data?.displayName || user?.username || 'bạn');
      setShowSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể lưu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAll = () => {
    router.replace('/tabs/home');
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
      <AuthBackdrop />
      <Dots />

      <Animated.View style={[s.content, {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }]}>

        {step === 0 && (
          <View style={s.stepWrap}>
            <Text style={s.bigEmoji}></Text>
            <Text style={s.title}>Chào mừng đến với Ripple</Text>
            <Text style={s.subtitle}>
              Nơi bạn ghi lại cảm xúc,{'\n'}hiểu bản thân hơn mỗi ngày.
            </Text>
            <Text style={s.hint}>Cho mình biết thêm một chút về bạn nhé</Text>
            <View style={s.actionSlot}>
              <Button title="Bắt đầu nào" onPress={() => animateNext(1)} />
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={s.stepWrap}>
            <Text style={s.bigEmoji}></Text>
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
              <Text style={s.preview}>Xin chào, {displayName}</Text>
            ) : null}
            <View style={s.actionSlot}>
              <Button title="Tiếp theo" onPress={() => animateNext(2)} />
            </View>
            <TouchableOpacity onPress={() => animateNext(2)} style={s.btnSkip}>
              <Text style={s.skipText}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={s.stepWrap}>
            <Text style={s.bigEmoji}></Text>
            <Text style={s.title}>Bạn bao nhiêu tuổi?</Text>
            <Text style={s.subtitle}>
              Giúp tôi hiểu bạn hơn{'\n'}và cá nhân hóa trải nghiệm.
            </Text>

            <View style={s.ageControlSlot}>
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
                <TouchableOpacity style={s.ageTouchable} activeOpacity={1} onPress={handleTapAge}>
                  <View style={s.pickerWrap}>
                    <View style={s.pickerSelector} pointerEvents="none" />
                    <FlatList
                      ref={listRef}
                      style={s.pickerList}
                      data={AGES}
                      keyExtractor={(item) => String(item)}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate="fast"
                      onScroll={onScrollAge}
                      scrollEventThrottle={16}
                      onMomentumScrollEnd={onScrollEnd}
                      onScrollEndDrag={onScrollEnd}
                      onLayout={() => setPickerReady(true)}
                      getItemLayout={(_, index) => ({
                        length: ITEM_HEIGHT,
                        offset: ITEM_HEIGHT * index,
                        index,
                      })}
                      ListHeaderComponent={<View style={s.pickerSpacer} />}
                      ListFooterComponent={<View style={s.pickerSpacer} />}
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
                    <View style={s.pickerOverlayTop} pointerEvents="none" />
                    <View style={s.pickerOverlayBottom} pointerEvents="none" />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {error ? <Text style={s.error}>{error}</Text> : null}

            <View style={s.actionSlot}>
              <Button
                title={loading ? 'Đang lưu...' : 'Hoàn tất'}
                onPress={handleDone}
                disabled={loading}
              />
            </View>
            <TouchableOpacity onPress={handleSkipAll} style={s.btnSkip} disabled={loading}>
              <Text style={s.skipText}>Để sau</Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>

      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalEmoji}>🎉</Text>
            <Text style={s.modalTitle}>Đã lưu!</Text>
            <Text style={s.modalText}>
              Chào {savedName}, hành trình cảm xúc của bạn bắt đầu từ đây.
            </Text>
            <View style={s.modalActionSlot}>
              <Button
                title="Tiếp tục"
                onPress={() => {
                setShowSuccess(false);
                router.replace('/tabs/home');
              }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
