import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { soraPromoStyles as s } from '../../styles/home/primary-cta.styles';
import { SoraInHalo } from '../shared/Sora';

export default function SoraPromoCard() {
  const handleStart = () => {
    router.push('/tabs/chat');
  };

  return (
    <TouchableOpacity
      style={s.wrap}
      onPress={handleStart}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Trò chuyện cùng Sora"
    >
      <View style={s.textBlock}>
        <Text style={s.title}>Trò chuyện cùng Sora</Text>
        <Text style={s.body}>Chia sẻ cảm xúc của bạn,{'\n'}Sora luôn lắng nghe.</Text>
        <View style={s.ctaPill}>
          <Text style={s.ctaPillText}>Bắt đầu</Text>
        </View>
      </View>
      <SoraInHalo size={58} pose="hug" haloSize={78} withShadow idPrefix="home-sora-promo" />
    </TouchableOpacity>
  );
}
