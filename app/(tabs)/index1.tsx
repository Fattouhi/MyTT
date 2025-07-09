import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Database, Phone, Calendar, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Dashboard</Text>
          <Text style={[styles.welcome, { color: theme.colors.textSecondary }]}>
            Welcome back, {user.name}
          </Text>
        </View>

        <View style={styles.grid}>
          <Card style={styles.balanceCard}>
            <View style={styles.cardHeader}>
              <Database size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Data Balance</Text>
            </View>
            <Text style={[styles.balanceAmount, { color: theme.colors.primary }]}>
              {user.dataBalance.toFixed(2)} GB
            </Text>
            <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
              Remaining data
            </Text>
          </Card>

          <Card style={styles.balanceCard}>
            <View style={styles.cardHeader}>
              <Phone size={24} color={theme.colors.secondary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Call Credit</Text>
            </View>
            <Text style={[styles.balanceAmount, { color: theme.colors.secondary }]}>
              {user.callCredit.toFixed(2)} TND
            </Text>
            <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
              Available credit
            </Text>
          </Card>
        </View>

        <Card style={styles.invoiceCard}>
          <View style={styles.cardHeader}>
            <Calendar size={24} color={theme.colors.accent} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Next Invoice</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <View style={styles.invoiceRow}>
              <Text style={[styles.invoiceLabel, { color: theme.colors.textSecondary }]}>
                Due Date:
              </Text>
              <Text style={[styles.invoiceValue, { color: theme.colors.text }]}>
                {new Date(user.nextInvoiceDate).toLocaleDateString('en-GB')}
              </Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={[styles.invoiceLabel, { color: theme.colors.textSecondary }]}>
                Amount:
              </Text>
              <Text style={[styles.invoiceValue, { color: theme.colors.text }]}>
                {user.nextInvoiceAmount.toFixed(2)} TND
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.accountCard}>
          <View style={styles.cardHeader}>
            <User size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Account Info</Text>
          </View>
          <View style={styles.accountInfo}>
            <View style={styles.accountRow}>
              <Text style={[styles.accountLabel, { color: theme.colors.textSecondary }]}>
                Phone Number:
              </Text>
              <Text style={[styles.accountValue, { color: theme.colors.text }]}>
                {user.phoneNumber}
              </Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={[styles.accountLabel, { color: theme.colors.textSecondary }]}>
                Customer Name:
              </Text>
              <Text style={[styles.accountValue, { color: theme.colors.text }]}>
                {user.name}
              </Text>
            </View>
          </View>
        </Card>
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
  welcome: {
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
  },
  invoiceCard: {
    marginBottom: 16,
  },
  invoiceInfo: {
    marginTop: 12,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  invoiceLabel: {
    fontSize: 14,
  },
  invoiceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountCard: {
    marginBottom: 16,
  },
  accountInfo: {
    marginTop: 12,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accountLabel: {
    fontSize: 14,
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});