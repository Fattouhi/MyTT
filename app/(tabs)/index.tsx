import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Phone,
  Wifi,
  CreditCard,
  TrendingUp,
  Clock,
  Zap,
  Gift,
  Bell,
  Star,
  Activity,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

interface ServiceCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
  color: string;
  gradient: string[];
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [balance] = useState(45.6);
  const [dataUsage] = useState({ used: 3.2, total: 5.0 });
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const serviceCards: ServiceCard[] = [
    {
      id: '1',
      title: 'Balance',
      icon: <CreditCard size={24} color="#FFFFFF" />,
      value: `${balance.toFixed(2)} TND`,
      subtitle: 'Available Credit',
      color: '#667eea',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: '2',
      title: 'Data Usage',
      icon: <Wifi size={24} color="#FFFFFF" />,
      value: `${dataUsage.used}GB`,
      subtitle: `of ${dataUsage.total}GB used`,
      color: '#f093fb',
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      id: '3',
      title: 'Minutes Left',
      icon: <Phone size={24} color="#FFFFFF" />,
      value: '847',
      subtitle: 'Minutes remaining',
      color: '#4facfe',
      gradient: ['#4facfe', '#00f2fe'],
    },
    {
      id: '4',
      title: 'SMS Left',
      icon: <Zap size={24} color="#FFFFFF" />,
      value: '156',
      subtitle: 'Messages remaining',
      color: '#43e97b',
      gradient: ['#43e97b', '#38f9d7'],
    },
  ];

  const quickActions = [
    {
      id: '1',
      title: 'Recharge',
      icon: <CreditCard size={20} color="#667eea" />,
      action: () => {},
    },
    {
      id: '2',
      title: 'Data Plans',
      icon: <Wifi size={20} color="#f093fb" />,
      action: () => {},
    },
    {
      id: '3',
      title: 'Call History',
      icon: <Phone size={20} color="#4facfe" />,
      action: () => {},
    },
    {
      id: '4',
      title: 'Support',
      icon: <Bell size={20} color="#43e97b" />,
      action: () => {},
    },
  ];

  const ServiceCardComponent = ({
    item,
    index,
  }: {
    item: ServiceCard;
    index: number;
  }) => {
    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        style={[
          styles.serviceCard,
          {
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <Animatable.View
          animation="fadeInUp"
          delay={index * 100}
          duration={600}
        >
          <LinearGradient
            colors={item.gradient}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>{item.icon}</View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Text style={styles.cardValue}>{item.value}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

            {/* Progress bar for data usage */}
            {item.id === '2' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(dataUsage.used / dataUsage.total) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </LinearGradient>
        </Animatable.View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animatable.View
          animation="fadeInDown"
          duration={800}
          style={styles.header}
        >
          <View style={styles.greetingContainer}>
            <Text
              style={[styles.greeting, { color: theme.colors.textSecondary }]}
            >
              Good{' '}
              {new Date().getHours() < 12
                ? 'Morning'
                : new Date().getHours() < 18
                ? 'Afternoon'
                : 'Evening'}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.name || 'User'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={theme.colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>

        {/* Service Cards Grid */}
        <View style={styles.cardsGrid}>
          {serviceCards.map((item, index) => (
            <ServiceCardComponent key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" delay={400} duration={800}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <Animatable.View
                key={action.id}
                animation="fadeInUp"
                delay={500 + index * 100}
                duration={600}
              >
                <TouchableOpacity
                  style={[
                    styles.quickActionCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  onPress={action.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickActionIcon}>{action.icon}</View>
                  <Text
                    style={[
                      styles.quickActionTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    {action.title}
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>

        {/* Recent Activity */}
        <Animatable.View animation="fadeInUp" delay={600} duration={800}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Activity
          </Text>
          <Card style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View
                style={[styles.activityIcon, { backgroundColor: '#667eea' }]}
              >
                <TrendingUp size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text
                  style={[styles.activityTitle, { color: theme.colors.text }]}
                >
                  Recharge Successful
                </Text>
                <Text
                  style={[
                    styles.activityTime,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  2 hours ago • 20.00 TND
                </Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View
                style={[styles.activityIcon, { backgroundColor: '#f093fb' }]}
              >
                <Activity size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text
                  style={[styles.activityTitle, { color: theme.colors.text }]}
                >
                  Data Plan Activated
                </Text>
                <Text
                  style={[
                    styles.activityTime,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Yesterday • 5GB Monthly
                </Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View
                style={[styles.activityIcon, { backgroundColor: '#43e97b' }]}
              >
                <Gift size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text
                  style={[styles.activityTitle, { color: theme.colors.text }]}
                >
                  Bonus Minutes Added
                </Text>
                <Text
                  style={[
                    styles.activityTime,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  3 days ago • 100 minutes
                </Text>
              </View>
            </View>
          </Card>
        </Animatable.View>
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
    paddingTop: 24, // Added extra top padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32, // Increased bottom margin
    marginTop: 16, // Added top margin for extra space
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4757',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  serviceCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickActionCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
});
