import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { FileText } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function FactureScreen() {
  const { theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [factureStatus, setFactureStatus] = useState<string | null>(null);

  const handleCheckFacture = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    // Mock response for testing: facture is always paid
    setFactureStatus('Paid');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Check Facture</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Verify the payment status of your facture
          </Text>
        </View>

        <Card style={styles.phoneCard}>
          <View style={styles.cardHeader}>
            <FileText size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Phone Number</Text>
          </View>
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Number"
            keyboardType="phone-pad"
          />
        </Card>

        {factureStatus && (
          <Card style={styles.resultCard}>
            <Text style={[styles.resultTitle, { color: theme.colors.text }]}>Facture Status</Text>
            <Text style={[styles.resultValue, { color: theme.colors.success }]}>
              {factureStatus}
            </Text>
          </Card>
        )}

        <Button
          title="Check Status"
          onPress={handleCheckFacture}
          fullWidth
        />
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
  phoneCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultCard: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});