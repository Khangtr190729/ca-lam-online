import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { formatVND } from '../../utils/formatters';

export const StoreInfoSection = ({ store, roleInStore, hourlyWage }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="storefront" size={18} color={colors.primary} />
        <Text style={styles.cardTitle}>Thông tin cửa hàng</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Cửa hàng:</Text>
        <Text style={styles.infoValue}>{store?.name || 'Chưa tham gia'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Chế độ làm việc:</Text>
        <View style={styles.roleInStoreBadge}>
          <Text style={styles.roleInStoreText}>
            {roleInStore === 'FULL_TIME' ? 'Full-time' : 'Part-time'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Lương thỏa thuận:</Text>
        <Text style={styles.wageValue}>{formatVND(hourlyWage)}/h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  roleInStoreBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roleInStoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  wageValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.success,
  },
});

export default StoreInfoSection;
