import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login, signup, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    phoneNumber?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      phoneNumber?: string;
      password?: string;
      name?: string;
      confirmPassword?: string;
    } = {};

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.length < 8) {
      newErrors.phoneNumber = 'Phone number must be at least 8 digits';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (authMode === 'signup') {
      if (!name) {
        newErrors.name = 'Name is required';
      } else if (name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    let success = false;

    if (authMode === 'login') {
      success = await login(phoneNumber, password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid phone number or password');
      }
    } else {
      success = await signup(phoneNumber, password, name);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    }
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setErrors({});
    // Clear form fields when switching modes
    setPhoneNumber('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Circles Animation */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={3000}
        style={[styles.floatingCircle, styles.circle1]}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={4000}
        style={[styles.floatingCircle, styles.circle2]}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={5000}
        style={[styles.floatingCircle, styles.circle3]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Logo */}
          <Animatable.View
            animation="fadeInDown"
            duration={1000}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <Animatable.View
                animation="rotate"
                iterationCount="infinite"
                duration={20000}
                style={styles.logoRing}
              />
              <BlurView intensity={20} style={styles.logoBlur}>
                <Image
                  source={require('../assets/images/icon.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </BlurView>
            </View>

            <Animatable.Text
              animation="fadeInUp"
              delay={300}
              style={styles.title}
            >
              MyTT Assistant
            </Animatable.Text>

            <Animatable.Text
              animation="fadeInUp"
              delay={500}
              style={styles.subtitle}
            >
              Manage your Tunisie Telecom services
            </Animatable.Text>
          </Animatable.View>

          {/* Auth Mode Toggle */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={600}
            style={styles.toggleContainer}
          >
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  authMode === 'login' && styles.activeToggleButton,
                ]}
                onPress={() => authMode !== 'login' && switchAuthMode()}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    authMode === 'login' && styles.activeToggleButtonText,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  authMode === 'signup' && styles.activeToggleButton,
                ]}
                onPress={() => authMode !== 'signup' && switchAuthMode()}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    authMode === 'signup' && styles.activeToggleButtonText,
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Auth Card */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={700}
            style={styles.cardContainer}
            key={authMode} // Force re-render when switching modes
          >
            <BlurView intensity={40} style={styles.cardBlur}>
              <View style={styles.authCard}>
                <Text style={styles.cardTitle}>
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {authMode === 'login'
                    ? 'Sign in to continue'
                    : 'Sign up to get started'}
                </Text>

                {/* Name field for signup */}
                {authMode === 'signup' && (
                  <Animatable.View
                    animation="fadeInUp"
                    duration={300}
                    style={styles.inputContainer}
                  >
                    <Input
                      label="Full Name"
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      error={errors.name}
                    />
                  </Animatable.View>
                )}

                <View style={styles.inputContainer}>
                  <Input
                    label="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    error={errors.phoneNumber}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    error={errors.password}
                  />
                </View>

                {/* Confirm Password field for signup */}
                {authMode === 'signup' && (
                  <Animatable.View
                    animation="fadeInUp"
                    duration={300}
                    style={styles.inputContainer}
                  >
                    <Input
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      secureTextEntry
                      error={errors.confirmPassword}
                    />
                  </Animatable.View>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    title={authMode === 'login' ? 'Sign In' : 'Sign Up'}
                    onPress={handleAuth}
                    loading={isLoading}
                    fullWidth
                  />
                </View>

                <View style={styles.demoInfo}>
                  <Text style={styles.demoText}>
                    {authMode === 'login'
                      ? 'Demo: Use any phone number (8+ digits) and password (4+ characters)'
                      : 'Demo: Use any phone number (8+ digits), name (2+ characters), and password (4+ characters)'}
                  </Text>
                </View>
              </View>
            </BlurView>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  circle1: {
    width: 80,
    height: 80,
    top: height * 0.1,
    left: width * 0.1,
  },
  circle2: {
    width: 120,
    height: 120,
    top: height * 0.2,
    right: width * 0.1,
  },
  circle3: {
    width: 60,
    height: 60,
    bottom: height * 0.3,
    left: width * 0.2,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  logoBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  toggleContainer: {
    marginBottom: 24,
  },
  toggleButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeToggleButtonText: {
    color: '#FFFFFF',
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  authCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  demoInfo: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  demoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
