import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

export const ShareEmailSection = ({
  email,
  copiedEmail,
  onCopyEmail,
  onRefreshStore,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.methodHeader}>
        <View style={[styles.badgeNumber, styles.badgeNumberAlt]}>
          <Text style={styles.badgeNumberTextAlt}>2</Text>
        </View>
        <Text style={styles.methodTitle}>Gửi Email tài khoản cho Chủ quán</Text>
      </View>
      <Text style={styles.methodDesc}>
        Chủ quán có thể thêm trực tiếp tài khoản của bạn vào hệ thống bằng Email:
      </Text>

      <View style={styles.emailBox}>
        <Text style={styles.emailText}>{email || 'email@calam.vn'}</Text>
        <TouchableOpacity
          onPress={onCopyEmail}
          style={styles.copyBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={copiedEmail ? 'checkmark-outline' : 'copy-outline'}
            size={16}
            color={copiedEmail ? colors.success : colors.primary}
          />
          <Text
            style={[
              styles.copyBtnText,
              copiedEmail && { color: colors.success },
            ]}
          >
            {copiedEmail ? 'Đã sao chép' : 'Sao chép'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.refreshStoreBtn}
        onPress={onRefreshStore}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh-outline" size={16} color={colors.primary} />
        <Text style={styles.refreshStoreBtnText}>
          Đã được thêm? Bấm kiểm tra lại
        </Text>
      </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badgeNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumberAlt: {
    backgroundColor: '#3B82F6',
  },
  badgeNumberTextAlt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  methodDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 17,
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  emailText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  refreshStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  refreshStoreBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default ShareEmailSection;
