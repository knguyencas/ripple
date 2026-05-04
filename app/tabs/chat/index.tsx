import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { chatStyles as s } from '../../../styles/chat/chat.styles';
import { useAuthStore } from '../../../stores/auth.store';
import api from '../../../services/core/api';
import { SoraInHalo } from '../../../components/shared/Sora';
import AppBackButton from '../../../components/shared/AppBackButton';
import {
  loadChatHistory,
  saveChatHistory,
  ChatMessage as Message,
} from '../../../services/chat/chat-history.service';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'assistant',
    text: 'Xin chào! Mình là Ripple AI — người bạn đồng hành cảm xúc của bạn.\n\nBạn đang cảm thấy thế nào hôm nay? Hãy chia sẻ bất cứ điều gì bạn muốn nhé.',
    time: new Date(),
  },
];

const QUICK_REPLIES = [
  'Hôm nay tôi cảm thấy lo lắng',
  'Tôi không biết mình đang cảm thấy gì',
  'Tôi muốn nói chuyện về ngày hôm nay',
  'Cho tôi một lời khuyên',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    (async () => {
      const stored = await loadChatHistory();
      if (stored.length > 0) setMessages(stored);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveChatHistory(messages);
  }, [messages, hydrated]);

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
      const res = await api.post(
        '/chat',
        {
          messages: messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.text,
            }))
            .concat({ role: 'user', content: text.trim() })
            .slice(-10),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: res.data.reply || 'Mình không hiểu, bạn thử nói lại nhé.',
        time: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Xin lỗi, mình đang gặp sự cố kết nối. Bạn thử lại sau nhé.',
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
          <AppBackButton style={s.headerBackButton} />

          <SoraInHalo
            size={32}
            haloSize={46}
            pose="idle"
            withShadow
            idPrefix="chat-header-sora"
          />

          <View style={s.headerTextBlock}>
            <Text style={s.headerName}>Sora</Text>
            <Text style={s.headerStatus}>● Đang lắng nghe bạn</Text>
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
                    <SoraInHalo size={20} haloSize={28} pose="idle" idPrefix={`chat-sora-${msg.id}`} />
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
              <SoraInHalo size={20} haloSize={28} pose="idle" idPrefix="chat-sora-typing" />
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
            placeholder="Nhắn tin với Sora..."
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
