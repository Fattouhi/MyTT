import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { CreditCard, Smartphone } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

const rechargeAmounts = [5, 10, 20, 50, 100];

export default function RechargeScreen() {
  const { theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleRecharge = async () => {
    if (!phoneNumber || !selectedAmount || !cardNumber || !expiryDate || !cvv || !cardholderName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Success',
        `Recharge of ${selectedAmount} TND has been successfully processed for ${phoneNumber}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setPhoneNumber('');
              setSelectedAmount(0);
              setCardNumber('');
              setExpiryDate('');
              setCvv('');
              setCardholderName('');
            },
          },
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Recharge</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Top up your account or another number
          </Text>
        </View>

        <Card style={styles.phoneCard}>
          <View style={styles.cardHeader}>
            <Smartphone size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Phone Number</Text>
          </View>
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="98765432"
            keyboardType="phone-pad"
          />
        </Card>

        <Card style={styles.amountCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Select Amount</Text>
          <View style={styles.amountGrid}>
            {rechargeAmounts.map((amount) => (
              <Button
                key={amount}
                title={`${amount} TND`}
                onPress={() => handleAmountSelect(amount)}
                variant={selectedAmount === amount ? 'primary' : 'outline'}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <CreditCard size={24} color={theme.colors.secondary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Payment Information</Text>
          </View>
          
          <Input
            label="Cardholder Name"
            value={cardholderName}
            onChangeText={setCardholderName}
            placeholder="John Doe"
          />

          <Input
            label="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
          />

          <View style={styles.cardRow}>
            <View style={styles.cardField}>
              <Input
                label="Expiry Date"
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.cardField}>
              <Input
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        </Card>

        <View style={styles.summary}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Phone Number:
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {phoneNumber || 'Not specified'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Amount:
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {selectedAmount > 0 ? `${selectedAmount} TND` : 'Not selected'}
            </Text>
          </View>
        </View>

        <Button
          title="Process Recharge"
          onPress={handleRecharge}
          loading={isProcessing}
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
  amountCard: {
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  paymentCard: {
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardField: {
    flex: 1,
  },
  summary: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});