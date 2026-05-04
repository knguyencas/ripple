import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles as c } from '../../../styles/shared/common.styles';
import { profileStyles as s } from '../../../styles/profile/profile.styles';
import {
  profileHelpPageStyles as ps,
  profilePageStyles as p,
} from '../../../styles/profile/profile-pages.styles';
import AppBackButton from '../../../components/shared/AppBackButton';

const FAQ = [
  {
    q: 'Ripple có phải là bác sĩ tâm lý không?',
    a: 'Không. Ripple là người bạn đồng hành cảm xúc — giúp bạn ghi lại tâm trạng, tâm sự nhẹ nhàng. Ripple không chẩn đoán, không kê thuốc, không thay thế chuyên gia. Khi bạn gặp vấn đề nặng, hãy tìm đến chuyên gia tâm lý nhé.',
  },
  {
    q: 'Dữ liệu của tôi được lưu ở đâu?',
    a: 'Journal, bước chân, giấc ngủ và uống nước được lưu trên server của Ripple. Lịch sử chat chỉ lưu trên điện thoại của bạn (AsyncStorage), tự xoá sau 30 ngày. Ripple không chia sẻ data với bên thứ ba.',
  },
  {
    q: 'Làm sao đổi mật khẩu?',
    a: 'Vào Hồ sơ → Bảo mật & Mật khẩu → nhập mật khẩu cũ và mật khẩu mới.',
  },
  {
    q: 'AI trả lời sai hoặc không phù hợp thì sao?',
    a: 'AI là mô hình ngôn ngữ, có thể hiểu sai đôi lúc. Nếu câu trả lời không phù hợp, bạn có thể bỏ qua hoặc nhắn lại. Gửi phản hồi qua mục "Gửi phản hồi" để đội ngũ cải thiện.',
  },
  {
    q: 'Tôi không muốn chia sẻ data sức khoẻ (bước, ngủ)?',
    a: 'Không bắt buộc. Bạn có thể từ chối quyền truy cập Apple Health / Health Connect. App vẫn hoạt động bình thường với journal và chat.',
  },
  {
    q: 'Làm sao xoá tài khoản?',
    a: 'Tính năng này đang được phát triển. Tạm thời, bạn có thể liên hệ support@ripple.app để được hỗ trợ.',
  },
  {
    q: 'Liên hệ hỗ trợ?',
    a: 'Email: support@ripple.app',
  },
];

export default function HelpScreen() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <SafeAreaView style={c.safe}>
      <ScrollView contentContainerStyle={p.scrollBottom}>
        <View style={s.header}>
          <AppBackButton />
          <Text style={s.headerTitle}>Trợ giúp & FAQ</Text>
        </View>

        <View style={p.content}>
          {FAQ.map((item, index) => {
            const open = openIdx === index;
            return (
              <TouchableOpacity
                key={index}
                style={ps.item}
                onPress={() => setOpenIdx(open ? null : index)}
                activeOpacity={0.7}
              >
                <View style={ps.qRow}>
                  <Text style={ps.q}>{item.q}</Text>
                  <Text style={ps.chevron}>{open ? '−' : '+'}</Text>
                </View>
                {open && <Text style={ps.a}>{item.a}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
