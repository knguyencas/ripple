import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles as c } from '../../../styles/shared/common.styles';
import { profileStyles as s } from '../../../styles/profile/profile.styles';
import {
  profilePageStyles as p,
  profileTermsPageStyles as ps,
} from '../../../styles/profile/profile-pages.styles';
import AppBackButton from '../../../components/shared/AppBackButton';

export default function TermsScreen() {
  return (
    <SafeAreaView style={c.safe}>
      <ScrollView contentContainerStyle={p.scrollBottomLarge}>
        <View style={s.header}>
          <AppBackButton />
          <Text style={s.headerTitle}>Điều khoản & Quyền riêng tư</Text>
        </View>

        <View style={p.content}>
          <Text style={ps.section}>1. Phạm vi dịch vụ</Text>
          <Text style={ps.paragraph}>
            Ripple là ứng dụng đồng hành cảm xúc, cung cấp công cụ ghi chép tâm trạng,
            theo dõi thói quen và trò chuyện với AI. Ripple KHÔNG phải dịch vụ y tế, không
            chẩn đoán, không kê thuốc và không thay thế chuyên gia tâm lý.
          </Text>

          <Text style={ps.section}>2. Dữ liệu cá nhân</Text>
          <Text style={ps.paragraph}>
            Chúng tôi thu thập: tên hiển thị, nhóm tuổi (tuỳ chọn), email (tuỳ chọn), nội
            dung journal, dữ liệu bước chân / giấc ngủ / uống nước do bạn chia sẻ, và các
            tương tác với AI chat.
          </Text>

          <Text style={ps.section}>3. Sử dụng dữ liệu</Text>
          <Text style={ps.paragraph}>
            Dữ liệu được dùng để cá nhân hoá trải nghiệm, cải thiện chất lượng AI và phân
            tích ẩn danh để nâng cấp sản phẩm. Chúng tôi KHÔNG bán dữ liệu cho bên thứ ba.
          </Text>

          <Text style={ps.section}>4. Lưu trữ</Text>
          <Text style={ps.paragraph}>
            Journal và dữ liệu sức khoẻ lưu trên server. Lịch sử chat chỉ lưu trên thiết
            bị của bạn và tự xoá sau 30 ngày.
          </Text>

          <Text style={ps.section}>5. Quyền của bạn</Text>
          <Text style={ps.paragraph}>
            Bạn có thể chỉnh sửa hồ sơ, đổi mật khẩu, hoặc yêu cầu xoá tài khoản bất cứ lúc
            nào qua email support@ripple.app.
          </Text>

          <Text style={ps.section}>6. Giới hạn trách nhiệm</Text>
          <Text style={ps.paragraph}>
            Ripple cung cấp "as-is". Trong trường hợp khủng hoảng tâm lý, vui lòng tìm đến
            chuyên gia hoặc người thân — Ripple không phải công cụ cấp cứu.
          </Text>

          <Text style={ps.section}>7. Thay đổi điều khoản</Text>
          <Text style={ps.paragraph}>
            Điều khoản có thể được cập nhật. Phiên bản mới sẽ được thông báo trong ứng dụng.
          </Text>

          <Text style={ps.footer}>Phiên bản: bản nháp 1.0 — cập nhật 2026-04-20</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
