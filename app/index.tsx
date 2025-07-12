import React, { useState, useCallback, useEffect } from 'react';
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
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type AuthMode = 'login' | 'signup';

interface ValidationState {
  phoneNumber: {
    isValid: boolean;
    message: string;
    hasBeenTouched: boolean;
  };
  password: {
    isValid: boolean;
    message: string;
    hasBeenTouched: boolean;
  };
  name: {
    isValid: boolean;
    message: string;
    hasBeenTouched: boolean;
  };
  confirmPassword: {
    isValid: boolean;
    message: string;
    hasBeenTouched: boolean;
  };
}

export default function LoginScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { login, signup, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [validation, setValidation] = useState<ValidationState>({
    phoneNumber: { isValid: false, message: '', hasBeenTouched: false },
    password: { isValid: false, message: '', hasBeenTouched: false },
    name: { isValid: false, message: '', hasBeenTouched: false },
    confirmPassword: { isValid: false, message: '', hasBeenTouched: false },
  });

  // Real-time validation functions
  const validatePhoneNumber = useCallback((phone: string) => {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }
    // Remove any non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      return {
        isValid: false,
        message: `Phone number must be exactly 8 digits (${cleanPhone.length}/8)`,
      };
    }
    if (cleanPhone.length > 8) {
      return {
        isValid: false,
        message: 'Phone number must be exactly 8 digits',
      };
    }
    return { isValid: true, message: 'Valid phone number ✓' };
  }, []);

  const validatePassword = useCallback((pwd: string) => {
    if (!pwd) {
      return { isValid: false, message: 'Password is required' };
    }
    if (pwd.length < 6) {
      return {
        isValid: false,
        message: `Password must be at least 6 characters (${pwd.length}/6)`,
      };
    }
    return { isValid: true, message: 'Valid password ✓' };
  }, []);

  const validateName = useCallback((n: string) => {
    if (!n) {
      return { isValid: false, message: 'Name is required' };
    }
    if (n.length < 2) {
      return {
        isValid: false,
        message: `Name must be at least 2 characters (${n.length}/2)`,
      };
    }
    return { isValid: true, message: 'Valid name ✓' };
  }, []);

  const validateConfirmPassword = useCallback(
    (confirmPwd: string, originalPwd: string) => {
      if (!confirmPwd) {
        return { isValid: false, message: 'Please confirm your password' };
      }
      if (confirmPwd !== originalPwd) {
        return { isValid: false, message: 'Passwords do not match' };
      }
      return { isValid: true, message: 'Passwords match ✓' };
    },
    []
  );

  // Handle phone number input with formatting
  const handlePhoneNumberChange = (text: string) => {
    // Only allow digits and limit to 8 characters
    const cleanText = text.replace(/\D/g, '').slice(0, 8);
    setPhoneNumber(cleanText);

    // Update validation
    const phoneValidation = validatePhoneNumber(cleanText);
    setValidation((prev) => ({
      ...prev,
      phoneNumber: {
        ...phoneValidation,
        hasBeenTouched: true,
      },
    }));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const passwordValidation = validatePassword(text);
    setValidation((prev) => ({
      ...prev,
      password: {
        ...passwordValidation,
        hasBeenTouched: true,
      },
    }));
  };

  const handleNameChange = (text: string) => {
    setName(text);
    const nameValidation = validateName(text);
    setValidation((prev) => ({
      ...prev,
      name: {
        ...nameValidation,
        hasBeenTouched: true,
      },
    }));
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    const confirmPasswordValidation = validateConfirmPassword(text, password);
    setValidation((prev) => ({
      ...prev,
      confirmPassword: {
        ...confirmPasswordValidation,
        hasBeenTouched: true,
      },
    }));
  };

  // Update confirm password validation when password changes
  useEffect(() => {
    if (validation.confirmPassword.hasBeenTouched && confirmPassword) {
      const confirmPasswordValidation = validateConfirmPassword(
        confirmPassword,
        password
      );
      setValidation((prev) => ({
        ...prev,
        confirmPassword: {
          ...confirmPasswordValidation,
          hasBeenTouched: true,
        },
      }));
    }
  }, [
    password,
    confirmPassword,
    validateConfirmPassword,
    validation.confirmPassword.hasBeenTouched,
  ]);

  const isFormValid = () => {
    const phoneValid = validation.phoneNumber.isValid;
    const passwordValid = validation.password.isValid;
    const nameValid = authMode === 'signup' ? validation.name.isValid : true;
    const confirmPasswordValid =
      authMode === 'signup' ? validation.confirmPassword.isValid : true;

    return phoneValid && passwordValid && nameValid && confirmPasswordValid;
  };

  const handleAuth = async () => {
    // Mark all fields as touched to show validation errors
    setValidation((prev) => ({
      phoneNumber: { ...prev.phoneNumber, hasBeenTouched: true },
      password: { ...prev.password, hasBeenTouched: true },
      name: { ...prev.name, hasBeenTouched: true },
      confirmPassword: { ...prev.confirmPassword, hasBeenTouched: true },
    }));

    if (!isFormValid()) {
      Alert.alert(
        'Invalid Form',
        'Please fix all validation errors before continuing.'
      );
      return;
    }

    let success = false;

    if (authMode === 'login') {
      success = await login(phoneNumber, password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Login Failed',
          'Please check your credentials and try again.'
        );
      }
    } else {
      success = await signup(phoneNumber, password, name);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Signup Failed',
          'Unable to create account. Please try again.'
        );
      }
    }
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    // Reset all form fields and validation
    setPhoneNumber('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setValidation({
      phoneNumber: { isValid: false, message: '', hasBeenTouched: false },
      password: { isValid: false, message: '', hasBeenTouched: false },
      name: { isValid: false, message: '', hasBeenTouched: false },
      confirmPassword: { isValid: false, message: '', hasBeenTouched: false },
    });
  };

  // Custom validation message component
  const ValidationMessage = ({
    field,
    authMode,
  }: {
    field: keyof ValidationState;
    authMode: AuthMode;
  }) => {
    const fieldValidation = validation[field];

    // Don't show validation for fields not required in current mode
    if (
      authMode === 'login' &&
      (field === 'name' || field === 'confirmPassword')
    ) {
      return null;
    }

    if (!fieldValidation.hasBeenTouched) {
      return null;
    }

    return (
      <Animatable.View
        animation={fieldValidation.isValid ? 'fadeInUp' : 'shake'}
        duration={300}
        style={[
          styles.validationMessage,
          {
            backgroundColor: fieldValidation.isValid
              ? theme.colors.success
              : theme.colors.error,
          },
        ]}
      >
        <Text
          style={[
            styles.validationText,
            { color: fieldValidation.isValid ? '#FFFFFF' : '#FFFFFF' },
          ]}
        >
          {fieldValidation.message}
        </Text>
      </Animatable.View>
    );
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? theme.colors.background : 'transparent'}
        translucent={!isDark}
      />

      {/* Background */}
      <View style={styles.background} />

      {/* Theme Toggle */}
      <Pressable onPress={toggleTheme} style={styles.themeToggle}>
        <View style={styles.themeToggleButton}>
          <Text style={styles.themeToggleText}>{isDark ? '☀️' : '🌙'}</Text>
        </View>
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
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
              <View style={styles.logoBlur}>
                <Image
                  source={require('../assets/images/icon.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
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
                activeOpacity={0.7}
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
                activeOpacity={0.7}
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
            key={authMode}
          >
            <View style={styles.authCard}>
              <Text style={styles.cardTitle}>
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {authMode === 'login'
                  ? 'Sign in to access your account'
                  : 'Join us to get started'}
              </Text>

              {/* Form Fields */}
              <View style={styles.formContainer}>
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
                      onChangeText={handleNameChange}
                      placeholder="Enter your full name"
                      error={
                        validation.name.hasBeenTouched &&
                        !validation.name.isValid
                          ? validation.name.message
                          : undefined
                      }
                    />
                    <ValidationMessage field="name" authMode={authMode} />
                  </Animatable.View>
                )}

                <View style={styles.inputContainer}>
                  <Input
                    label="Phone Number"
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    placeholder="12345678"
                    keyboardType="phone-pad"
                    error={
                      validation.phoneNumber.hasBeenTouched &&
                      !validation.phoneNumber.isValid
                        ? validation.phoneNumber.message
                        : undefined
                    }
                  />
                  <ValidationMessage field="phoneNumber" authMode={authMode} />
                </View>

                <View style={styles.inputContainer}>
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Enter your password"
                    secureTextEntry
                    error={
                      validation.password.hasBeenTouched &&
                      !validation.password.isValid
                        ? validation.password.message
                        : undefined
                    }
                  />
                  <ValidationMessage field="password" authMode={authMode} />
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
                      onChangeText={handleConfirmPasswordChange}
                      placeholder="Confirm your password"
                      secureTextEntry
                      error={
                        validation.confirmPassword.hasBeenTouched &&
                        !validation.confirmPassword.isValid
                          ? validation.confirmPassword.message
                          : undefined
                      }
                    />
                    <ValidationMessage
                      field="confirmPassword"
                      authMode={authMode}
                    />
                  </Animatable.View>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    title={authMode === 'login' ? 'Sign In' : 'Create Account'}
                    onPress={handleAuth}
                    loading={isLoading}
                    fullWidth
                    disabled={!isFormValid()}
                  />
                </View>
              </View>

              {/* Demo Info */}
              <View style={styles.demoInfo}>
                <Text style={styles.demoTitle}>Demo Mode</Text>
                <Text style={styles.demoText}>
                  {authMode === 'login'
                    ? 'Use exactly 8 digits for phone number and 6+ characters for password'
                    : 'Use exactly 8 digits for phone number, 2+ characters for name, and 6+ characters for password'}
                </Text>
              </View>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    background: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: theme.colors.background,
    },
    themeToggle: {
      position: 'absolute',
      top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
      right: 20,
      zIndex: 1000,
    },
    themeToggleButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    themeToggleText: {
      fontSize: 18,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: (StatusBar.currentHeight || 0) + 60,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      position: 'relative',
      width: 100,
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    logoRing: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    logoBlur: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    logoImage: {
      width: 40,
      height: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    toggleContainer: {
      marginBottom: 32,
    },
    toggleButtons: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 25,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      backgroundColor: '#3B82F6',
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
      color: theme.colors.textSecondary,
    },
    activeToggleButtonText: {
      color: '#FFFFFF',
    },
    cardContainer: {
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    authCard: {
      backgroundColor: theme.colors.surface,
      padding: 32,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    cardSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    formContainer: {
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 20,
    },
    buttonContainer: {
      marginTop: 8,
    },
    demoInfo: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    demoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    demoText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    validationMessage: {
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    validationText: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
      flex: 1,
    },
  });
