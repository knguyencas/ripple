import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { commonStyles as c } from '../../../styles/shared/common.styles';
import { profileStyles as s } from '../../../styles/profile/profile.styles';
import {
  profileFeedbackPageStyles as ps,
  profilePageStyles as p,
} from '../../../styles/profile/profile-pages.styles';
import api from '../../../services/core/api';
import AppBackButton from '../../../components/shared/AppBackButton';

export default function FeedbackScreen() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (rating < 1) {
      setError('Vui lòng chọn mức đánh giá.');
      return;
    }
    if (!message.trim()) {
      setError('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/feedback', { rating, message: message.trim() });
      Alert.alert('Cảm ơn!', 'Phản hồi của bạn đã được ghi nhận.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể gửi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={c.safe}>
      <KeyboardAvoidingView
        style={p.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={p.scrollBottom}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <AppBackButton />
            <Text style={s.headerTitle}>Gửi phản hồi</Text>
          </View>

          <View style={p.content}>
            <Text style={ps.label}>Bạn thấy Ripple thế nào?</Text>
            <View style={ps.starsRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setRating(value)}
                  style={ps.starBtn}
                >
                  <Text style={[ps.star, value <= rating && ps.starActive]}>
                    {value <= rating ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[ps.label, ps.labelTopSpacing]}>Phản hồi của bạn</Text>
            <Text style={ps.hint}>
              Chia sẻ điều bạn thích, chưa thích, hoặc đề xuất tính năng. Ý kiến của
              bạn giúp Ripple tốt hơn.
            </Text>
            <TextInput
              style={ps.textarea}
              value={message}
              onChangeText={setMessage}
              placeholder="Mình thấy…"
              placeholderTextColor="#9BB5C4"
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />

            {error ? <Text style={ps.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[ps.saveBtn, saving && ps.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textLight} />
              ) : (
                <Text style={ps.saveBtnText}>Gửi phản hồi</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
