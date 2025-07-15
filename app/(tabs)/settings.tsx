import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { Moon, Sun, LogOut, User, Bell, Shield, CircleHelp as HelpCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, hasSwitch = false, switchValue = false }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
  }) => (
    <Card style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {hasSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onPress}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={switchValue ? '#FFFFFF' : theme.colors.textSecondary}
          />
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Manage your account and preferences
          </Text>
        </View>

        {user && (
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={[styles.profileAvatar, { backgroundColor: theme.colors.primary }]}>
                <User size={32} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: theme.colors.text }]}>
                  {user.name}
                </Text>
                <Text style={[styles.profilePhone, { color: theme.colors.textSecondary }]}>
                  {user.phoneNumber}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          <SettingItem
            icon={isDark ? <Moon size={20} color={theme.colors.textSecondary} /> : <Sun size={20} color={theme.colors.textSecondary} />}
            title="Dark Mode"
            subtitle={isDark ? "Dark theme is enabled" : "Light theme is enabled"}
            hasSwitch
            switchValue={isDark}
            onPress={toggleTheme}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
          <SettingItem
            icon={<Bell size={20} color={theme.colors.textSecondary} />}
            title="Push Notifications"
            subtitle="Receive notifications about account updates"
            hasSwitch
            switchValue={true}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Security</Text>
          <SettingItem
            icon={<Shield size={20} color={theme.colors.textSecondary} />}
            title="Security Settings"
            subtitle="Manage your account security"
            onPress={() => Alert.alert('Info', 'Security settings would be implemented here')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
          <SettingItem
            icon={<HelpCircle size={20} color={theme.colors.textSecondary} />}
            title="Help & Support"
            subtitle="Get help with your account"
            onPress={() => Alert.alert('Info', 'Help & Support would be implemented here')}
          />
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  logoutSection: {
    marginTop: 24,
  },
});