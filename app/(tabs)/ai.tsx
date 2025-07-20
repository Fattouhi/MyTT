import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import {
  Send,
  Bot,
  User,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const GEMINI_API_KEY = 'AIzaSyCXZzX1L-ezgX_Of8n6Ck43xwguIJbi-qQ';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Tunisie Telecom USSD Codes Data - Updated with correct information
const USSD_CODES_DATA = `
*146# - Votre numéro d'appel et offre
*123*code secret de la carte# - Recharge de la ligne
*122# - Consultation solde et bonus
*122*3# - Suivi bonus corporate
*100# - Menu pour la gestion de tous les services utiles
*110# - Service MMS
*111# - Gestion de mon programme de fidélité Kélma
*150# - SOS Solde
*153*3*numéro bloqué * numéro cin # - Demande du code PUK
*172# - RIO Portabilité
*211# - Options++
*122*2# - Suivi du forfait internet mobile
*140*0# - Activation internet mobile
*120# - Portail WAP: wap.ahaya.tn
*109# - Service Black Berry
*122*8# - Suivi forfait Black Berry
*145# - Data_Packages
*182# - Forfait Facebook
*143# - 3G_provisioning_HUR
*43# - Activation double appel
*62*1162# - Activation appels manqués
*115# - Appel en conférence (Gratuit)
*108# - Forfait_International (Forfait Passeport)
*117*1# - Activation Roaming Prépayé
*147# - Service SMART roaming
*132# - Recharge_Fixe
*210# - ICFLIX
*209# - TTStreamning
*208# - MOUZIKTI (RBT)
*106# - 1DT = 40min
*107# - New_soir
*116# - 10mn Cons 30mn (Day pass)
*118# - Forfait Messagét
*130*1# - Activation DOUBLE
*130*2# - Activation BINETNA
*130*3# - Activation BEST
*125*1# - Suivi consommation BEST
*130*6# - Activation SIGOUNDA
*197# - ESS_1000
*212# - Offres partenariat KELMA
*214# - Mriguel
*129# - Elissa_300
*161# - Migration vers 1000TM (ancien client)
*162# - Migration vers 1000CSS (ancien client)
*205# - Migration vers Trankil Elissa
*202# - Migration TT verts TM (taraji mobile)
*201# - Migration de 1000%TT vers Trankil TT
*122*9# - Suivi forfait Messagét
*124*1# - SMS « Kallemni » restants
*128# - Elissa_Transfer_money_v3
*131# - Call_me_Ellissa
*133*Montant en millimes*N°GSMTT # - MobiRacid, Transfert du montant
*144# - Mobiracid_Telecom
*149# - Service Tabba3ni / TT_Follow_Me_USSD_Service
*180# - DUO (Numéro virtuel)
*189# - MOBI+ PoP (FAF)
*104# - Service Mobidinar (gratuit)
*203# - Option Libye – Algérie
1298 - Customer service / Service client
`;

const SYSTEM_PROMPT = `You are an expert AI assistant specialized in Tunisie Telecom's USSD dial codes and services. Your primary function is to provide accurate, concise, and helpful information regarding these codes based *only* on the data provided in the following list.

**Constraints and Guidelines:**
1. **Knowledge Base:** Your responses must be derived solely from the provided list of Tunisie Telecom dial codes. Do not use external knowledge or make assumptions about services not explicitly listed.
2. **Accuracy:** Provide the exact USSD code and the service it corresponds to.
3. **Clarity and Conciseness:** Answer user queries directly and efficiently. If a user asks for a specific service, provide the associated code.
4. **Handling Missing Information:** If a user asks for a code or service that is *not* present in the provided list, state clearly that you do not have information on that specific code or service, and suggest they contact Tunisie Telecom customer service at 1298.
5. **Language:** Respond clearly in the language of the user's query (English, French, or Arabic, typically used for these services).
6. **Formatting:** Format USSD codes clearly, usually starting with * and ending with #.
7. **Common Services:** For balance inquiry, the code is *122#. For recharge, it's *123*code secret de la carte#. For main services menu, it's *100#.

**Tunisie Telecom USSD Codes and Services Data:**
${USSD_CODES_DATA}

Please provide helpful and accurate responses based only on this data. Always double-check that you're providing the correct code from the list above.`;

export default function AIScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "مرحباً! أنا مساعد MyTT المتخصص في أكواد خدمات تونس تيليكوم. كيف يمكنني مساعدتك اليوم؟\n\nHello! I'm your MyTT Assistant specialized in Tunisie Telecom USSD codes. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'testing' | 'connected' | 'error'
  >('testing');
  const [connectionMessage, setConnectionMessage] = useState(
    'Testing API connection...'
  );

  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for typing indicator
  useEffect(() => {
    if (isTyping) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isTyping, pulseAnim]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Hello',
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content
          ) {
            setConnectionStatus('connected');
            setConnectionMessage('Connected');
          } else {
            throw new Error('Invalid API response');
          }
        } else {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('API connection test failed:', error);
        setConnectionStatus('error');

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('401')) {
          setConnectionMessage('Invalid API key');
        } else if (errorMessage.includes('403')) {
          setConnectionMessage('Access denied');
        } else if (errorMessage.includes('429')) {
          setConnectionMessage('Rate limit exceeded');
        } else if (
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('Failed to fetch')
        ) {
          setConnectionMessage('Network error');
        } else {
          setConnectionMessage('Connection failed');
        }
      }
    };

    testConnection();
  }, []);

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'أعتذر، لكنني واجهت خطأ. يرجى المحاولة مرة أخرى أو الاتصال بخدمة العملاء لتونس تيليكوم على 1298.\n\nI apologize, but I encountered an error. Please try again or contact Tunisie Telecom customer service at 1298.';
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Check connection status before sending
    if (connectionStatus === 'error') {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Cannot send message - API connection failed. Please check your connection and try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInputText = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await callGeminiAPI(currentInputText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'أعتذر، لكنني واجهت خطأ. يرجى المحاولة مرة أخرى أو الاتصال بخدمة العملاء لتونس تيليكوم على 1298.\n\nI apologize, but I encountered an error. Please try again or contact Tunisie Telecom customer service at 1298.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const retryConnection = () => {
    setConnectionStatus('testing');
    setConnectionMessage('Reconnecting...');

    // Re-run the connection test
    const testConnection = async () => {
      try {
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Hello',
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content
          ) {
            setConnectionStatus('connected');
            setConnectionMessage('Connected');
          } else {
            throw new Error('Invalid API response');
          }
        } else {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('API connection test failed:', error);
        setConnectionStatus('error');
        setConnectionMessage('Connection failed');
      }
    };

    testConnection();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isUser
            ? styles.userBubble
            : [styles.aiBubble, { backgroundColor: theme.colors.surface }],
          // Different max widths for user vs AI messages
          item.isUser ? styles.userBubbleWidth : styles.aiBubbleWidth,
        ]}
      >
        <View style={styles.messageHeader}>
          <View
            style={[
              styles.avatar,
              item.isUser ? styles.userAvatar : styles.aiAvatar,
            ]}
          >
            {item.isUser ? (
              <User size={14} color="#FFFFFF" />
            ) : (
              <Bot size={14} color="#FFFFFF" />
            )}
          </View>
          <Text
            style={[
              styles.messageText,
              { color: item.isUser ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            {item.text}
          </Text>
        </View>
        <Text
          style={[
            styles.timestamp,
            {
              color: item.isUser
                ? 'rgba(255,255,255,0.7)'
                : theme.colors.textSecondary,
            },
          ]}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessageContainer]}>
      <View
        style={[
          styles.messageBubble,
          styles.aiBubble,
          styles.aiBubbleWidth,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={[styles.avatar, styles.aiAvatar]}>
            <Bot size={14} color="#FFFFFF" />
          </View>
          <Animated.View
            style={[styles.typingIndicator, { opacity: pulseAnim }]}
          >
            <View
              style={[
                styles.typingDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.typingDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.typingDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            MyTT Assistant
          </Text>

          {/* Connection Status */}
          <View style={styles.statusContainer}>
            {connectionStatus === 'testing' && (
              <View style={styles.statusIndicator}>
                <Loader size={12} color="#FFA500" />
                <Text style={[styles.statusText, { color: '#FFA500' }]}>
                  {connectionMessage}
                </Text>
              </View>
            )}
            {connectionStatus === 'connected' && (
              <View style={styles.statusIndicator}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={[styles.statusText, { color: '#10B981' }]}>
                  {connectionMessage}
                </Text>
              </View>
            )}
            {connectionStatus === 'error' && (
              <View style={styles.statusIndicator}>
                <AlertCircle size={12} color="#EF4444" />
                <Text style={[styles.statusText, { color: '#EF4444' }]}>
                  {connectionMessage}
                </Text>
                <TouchableOpacity
                  onPress={retryConnection}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about USSD codes... اسأل عن أكواد الخدمات..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity:
                    !inputText.trim() || connectionStatus === 'error' ? 0.5 : 1,
                },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || connectionStatus === 'error'}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  retryButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  retryText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    paddingLeft: '20%', // Constrains user messages to 80% width
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
    paddingRight: '5%', // Allows AI messages to use 95% width
  },
  messageBubble: {
    borderRadius: 20,
    padding: 16,
    minWidth: 80,
    width: '100%', // Take full available width within container constraints
  },
  // Separate width styles for user and AI bubbles
  userBubbleWidth: {
    // User messages will be constrained by container paddingLeft
  },
  aiBubbleWidth: {
    // AI messages will be constrained by container paddingRight
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#F2F2F7',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  userAvatar: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  aiAvatar: {
    backgroundColor: '#007AFF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginLeft: 28,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
