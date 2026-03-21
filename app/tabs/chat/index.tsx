import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { useAuthStore } from '../../../stores/auth.store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'assistant',
    text: 'Xin chào! Mình là Ripple AI — người bạn đồng hành cảm xúc của bạn 🌊\n\nBạn đang cảm thấy thế nào hôm nay? Hãy chia sẻ bất cứ điều gì bạn muốn nhé.',
    time: new Date(),
  },
];

const QUICK_REPLIES = [
  'Hôm nay tôi cảm thấy lo lắng 😰',
  'Tôi không biết mình đang cảm thấy gì',
  'Tôi muốn nói chuyện về ngày hôm nay',
  'Cho tôi một lời khuyên',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { user, token } = useAuthStore();

  const displayName = user?.displayName || user?.username || 'bạn';

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 1200));
      const mockReplies = [
        `Mình hiểu cảm giác đó, ${displayName}. Hãy kể thêm cho mình nghe nhé — điều gì đã khiến bạn cảm thấy như vậy?`,
        'Cảm ơn bạn đã chia sẻ. Cảm xúc của bạn hoàn toàn hợp lý. Bạn có muốn thử một vài bài tập thở để thư giãn không?',
        'Nghe có vẻ khó khăn thật. Bạn đã ngủ đủ giấc và ăn uống đầy đủ chưa? Đôi khi những điều cơ bản nhất lại ảnh hưởng lớn đến tâm trạng của chúng ta.',
        'Mình ở đây lắng nghe bạn. Không cần phải vội vã — hãy cứ chia sẻ theo cách của bạn nhé 💙',
      ];
      const reply = mockReplies[Math.floor(Math.random() * mockReplies.length)];

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: reply,
        time: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Xin lỗi, mình đang gặp sự cố kết nối. Bạn thử lại sau nhé 🙏',
        time: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={s.header}>
          <View style={s.headerAvatar}>
            <Text style={s.headerAvatarText}>🌊</Text>
          </View>
          <View>
            <Text style={s.headerName}>Ripple AI</Text>
            <Text style={s.headerStatus}>● Luôn sẵn sàng lắng nghe</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={s.messages}
          contentContainerStyle={s.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, idx) => {
            const isAI = msg.role === 'assistant';
            const showTime = idx === 0 ||
              (msg.time.getTime() - messages[idx - 1].time.getTime()) > 60000;

            return (
              <View key={msg.id}>
                {showTime && (
                  <Text style={s.timeLabel}>{formatTime(msg.time)}</Text>
                )}
                <View style={[s.msgRow, isAI ? s.msgRowAI : s.msgRowUser]}>
                  {isAI && (
                    <View style={s.aiAvatar}>
                      <Text style={s.aiAvatarText}>🌊</Text>
                    </View>
                  )}
                  <View style={[s.bubble, isAI ? s.bubbleAI : s.bubbleUser]}>
                    <Text style={[s.bubbleText, isAI ? s.bubbleTextAI : s.bubbleTextUser]}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={[s.msgRow, s.msgRowAI]}>
              <View style={s.aiAvatar}>
                <Text style={s.aiAvatarText}>🌊</Text>
              </View>
              <View style={[s.bubble, s.bubbleAI, s.bubbleTyping]}>
                <Text style={s.typingDots}>• • •</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {messages.length <= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.quickReplies}
            contentContainerStyle={s.quickRepliesContent}
          >
            {QUICK_REPLIES.map((qr, i) => (
              <TouchableOpacity
                key={i}
                style={s.quickReply}
                onPress={() => sendMessage(qr)}
              >
                <Text style={s.quickReplyText}>{qr}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder="Nhắn tin với Ripple AI..."
            placeholderTextColor={Colors.placeholder}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={s.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.foam },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.foam,
  },
  headerAvatar: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: Colors.teal + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { fontSize: 22 },
  headerName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  headerStatus: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: Colors.teal,
  },

  // Messages
  messages: { flex: 1 },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  timeLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 8,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    gap: 8,
  },
  msgRowAI: { justifyContent: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: Colors.teal + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: { fontSize: 14 },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
  },
  bubbleAI: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.teal,
    borderBottomRightRadius: 4,
  },
  bubbleTyping: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bubbleText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextAI: { color: Colors.textPrimary },
  bubbleTextUser: { color: Colors.textLight },
  typingDots: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 4,
  },

  // Quick replies
  quickReplies: {
    maxHeight: 48,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickRepliesContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  quickReply: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickReplyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textPrimary,
  },

  // Input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.foam,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  sendBtnText: {
    fontSize: 18,
    color: Colors.textLight,
    fontFamily: 'Nunito_700Bold',
  },
});