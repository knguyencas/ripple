import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles as c } from '../../../styles/shared/common.styles';
import { profileStyles as s } from '../../../styles/profile/profile.styles';
import {
  profileLanguagePageStyles as ps,
  profilePageStyles as p,
} from '../../../styles/profile/profile-pages.styles';
import { getLang, setLang, Lang } from '../../../services/profile/prefs.service';
import AppBackButton from '../../../components/shared/AppBackButton';

const OPTIONS: { value: Lang; label: string; sub: string }[] = [
  { value: 'vi', label: 'Tiếng Việt', sub: 'Vietnamese' },
  { value: 'en', label: 'English', sub: 'Tiếng Anh' },
];

export default function LanguageScreen() {
  const [current, setCurrent] = useState<Lang>('vi');

  useEffect(() => {
    getLang().then(setCurrent);
  }, []);

  const handlePick = async (lang: Lang) => {
    setCurrent(lang);
    await setLang(lang);
  };

  return (
    <SafeAreaView style={c.safe}>
      <ScrollView contentContainerStyle={p.scrollBottom} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <AppBackButton />
          <Text style={s.headerTitle}>Ngôn ngữ</Text>
        </View>

        <View style={p.content}>
          <Text style={ps.note}>
            Tuỳ chọn sẽ được lưu. Giao diện đa ngôn ngữ sẽ được cập nhật ở phiên bản kế tiếp.
          </Text>

          <View style={ps.card}>
            {OPTIONS.map((option, index) => {
              const selected = current === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[ps.row, index < OPTIONS.length - 1 && ps.rowBorder]}
                  onPress={() => handlePick(option.value)}
                >
                  <View style={ps.rowBody}>
                    <Text style={ps.label}>{option.label}</Text>
                    <Text style={ps.sub}>{option.sub}</Text>
                  </View>
                  {selected && <Text style={ps.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
