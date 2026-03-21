import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  avgScore: number;
}

function getPhase(score: number) {
  if (score >= 4.5) return {
    phase: 'Giai đoạn Thịnh vượng',
    emoji: '🌟',
    desc: 'Bạn đang ở trạng thái tâm lý tốt nhất — năng lượng cao, tích cực và kết nối tốt với bản thân.',
    color: Colors.moodScale[10],
    quote: '"Hãy tận dụng năng lượng này để tạo ra những điều tuyệt vời. Bạn đang ở đỉnh cao của mình."',
  };
  if (score >= 3.5) return {
    phase: 'Giai đoạn Cân bằng',
    emoji: '🌿',
    desc: 'Tâm lý ổn định, bạn đang duy trì trạng thái cân bằng tốt giữa cảm xúc và lý trí.',
    color: Colors.moodScale[7],
    quote: '"Sự bình yên không phải là vắng lặng hoàn toàn — mà là bình thản giữa sóng gió."',
  };
  if (score >= 2.5) return {
    phase: 'Giai đoạn Thích nghi',
    emoji: '🌱',
    desc: 'Bạn đang đối mặt với một số thách thức. Đây là lúc cần quan tâm đến bản thân hơn.',
    color: Colors.moodScale[5],
    quote: '"Mỗi ngày khó khăn đều là bước đệm để bạn trưởng thành hơn. Hãy kiên nhẫn với bản thân."',
  };
  if (score >= 1.5) return {
    phase: 'Giai đoạn Phục hồi',
    emoji: '🌧️',
    desc: 'Tâm lý đang ở mức thấp. Hãy ưu tiên nghỉ ngơi và tìm kiếm sự hỗ trợ nếu cần.',
    color: Colors.moodScale[3],
    quote: '"Cảm thấy mệt mỏi không có nghĩa là yếu đuối. Nghỉ ngơi cũng là một dạng dũng cảm."',
  };
  return {
    phase: 'Giai đoạn Khủng hoảng',
    emoji: '🌑',
    desc: 'Bạn đang trải qua giai đoạn rất khó khăn. Hãy liên hệ người thân hoặc chuyên gia tâm lý.',
    color: Colors.moodScale[1],
    quote: '"Trong bóng tối nhất, ngay cả ánh sáng nhỏ nhất cũng đủ để soi đường. Bạn không đơn độc."',
  };
}

export default function PsychPhaseCard({ avgScore }: Props) {
  const { phase, emoji, desc, color, quote } = getPhase(avgScore);

  return (
    <View>
      {/* Phase card */}
      <View style={[s.phaseCard, { borderLeftColor: color }]}>
        <View style={s.phaseTop}>
          <Text style={s.phaseEmoji}>{emoji}</Text>
          <View style={s.phaseInfo}>
            <Text style={s.phaseLabel}>Nhận định tâm lý</Text>
            <Text style={s.phaseName}>{phase}</Text>
          </View>
          <View style={[s.scoreBadge, { backgroundColor: color + '30' }]}>
            <Text style={[s.scoreText, { color }]}>{avgScore.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={s.phaseDesc}>{desc}</Text>
      </View>

      {/* Quote card */}
      <View style={s.quoteCard}>
        <Text style={s.quoteIcon}>💭</Text>
        <Text style={s.quoteText}>{quote}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  phaseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  phaseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  phaseEmoji: { fontSize: 32 },
  phaseInfo: { flex: 1 },
  phaseLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  phaseName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  scoreBadge: {
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
  },
  phaseDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  quoteCard: {
    backgroundColor: Colors.ocean + '12',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  quoteIcon: { fontSize: 20, marginTop: 2 },
  quoteText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 21,
  },
});