import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { Send, Bot, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const mockResponses = [
  "To transfer credit to another number, dial *177*recipient_number*amount# and press call. For example: *177*98765432*5# to transfer 5 TND.",
  "You can check your balance by dialing *126# or through the MyTT app dashboard.",
  "To activate a data package, dial *129# and follow the menu options, or use the MyTT app to browse available packages.",
  "For customer service, call 1298 from your Tunisie Telecom number, or visit the nearest Tunisie Telecom store.",
  "To check your remaining data, dial *126# or view it in the MyTT app dashboard.",
  "Bill payments can be made through the MyTT app, at Tunisie Telecom stores, or authorized payment centers.",
];

export default function AIScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your MyTT Assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <View style={styles.messageHeader}>
        <View style={[styles.messageIcon, { backgroundColor: item.isUser ? theme.colors.primary : theme.colors.secondary }]}>
          {item.isUser ? (
            <User size={16} color="#FFFFFF" />
          ) : (
            <Bot size={16} color="#FFFFFF" />
          )}
        </View>
        <Text style={[styles.messageTime, { color: theme.colors.textSecondary }]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Card style={[styles.messageBubble, { backgroundColor: item.isUser ? theme.colors.primary : theme.colors.surface }]}>
        <Text style={[styles.messageText, { color: item.isUser ? '#FFFFFF' : theme.colors.text }]}>
          {item.text}
        </Text>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>AI Assistant</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Ask me anything about your MyTT services
        </Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Card style={styles.typingBubble}>
            <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>
              AI is typing...
            </Text>
          </Card>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <Input
            label=""
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your question..."
            multiline
            numberOfLines={2}
          />
          <Button
            title=""
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#FFFFFF" />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageTime: {
    fontSize: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  typingContainer: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  typingBubble: {
    padding: 12,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
});