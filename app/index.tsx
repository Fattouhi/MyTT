import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { initiatePhoneNumberLogin, verifyLoginCode, initiatePhoneNumberSignup, verifySignupCode, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [errors, setErrors] = useState<{ phoneNumber?: string; code?: string; name?: string }>({});

  const validatePhoneNumber = () => {
    const newErrors: { phoneNumber?: string; name?: string } = {};

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.length < 8) {
      newErrors.phoneNumber = 'Phone number must be at least 8 digits';
    }

    if (isSignup && !name) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors: { code?: string } = {};

    if (!code) {
      newErrors.code = 'Verification code is required';
    } else if (code.length < 6) {
      newErrors.code = 'Verification code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitiateAuth = async () => {
    if (!validatePhoneNumber()) return;

    const success = isSignup
      ? await initiatePhoneNumberSignup(phoneNumber, name)
      : await initiatePhoneNumberLogin(phoneNumber);

    if (success) {
      setIsCodeSent(true);
    } else {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    if (!validateCode()) return;

    const success = isSignup
      ? await verifySignupCode(code)
      : await verifyLoginCode(code);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid verification code');
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setErrors({});
    setCode('');
    setIsCodeSent(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
              <Phone size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>MyTT Assistant</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Manage your Tunisie Telecom services
            </Text>
          </View>

          <Card style={styles.loginCard}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {isSignup ? 'Sign Up' : 'Sign In'}
            </Text>

            {!isCodeSent ? (
              <>
                {isSignup && (
                  <Input
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    error={errors.name}
                  />
                )}
                <Input
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="98765432"
                  keyboardType="phone-pad"
                  error={errors.phoneNumber}
                />
                <div id="recaptcha-container"></div>
                <Button
                  title={isSignup ? 'Send Signup Code' : 'Send Login Code'}
                  onPress={handleInitiateAuth}
                  loading={isLoading}
                  fullWidth
                />
                <View style={styles.switchButton}>
                  <Button
                    title={isSignup ? 'Switch to Sign In' : 'Switch to Sign Up'}
                    onPress={toggleAuthMode}
                    variant="outline"
                    fullWidth
                  />
                </View>
              </>
            ) : (
              <>
                <Input
                  label="Verification Code"
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  keyboardType="numeric"
                  error={errors.code}
                />
                <Button
                  title="Verify Code"
                  onPress={handleVerifyCode}
                  loading={isLoading}
                  fullWidth
                />
                <View style={styles.switchButton}>
                  <Button
                    title="Back to Phone Number"
                    onPress={() => setIsCodeSent(false)}
                    variant="outline"
                    fullWidth
                  />
                </View>
              </>
            )}

            <View style={styles.demoInfo}>
              <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
                Demo: {isSignup ? 'Enter any name and ' : ''}Use any phone number (8+ digits)
                {isCodeSent ? ' and any 6-digit code' : ''} for testing
              </Text>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  loginCard: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  demoInfo: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  demoText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  switchButton: {
    marginTop: 12,
  },
});