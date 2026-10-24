import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

export const EmptyShiftState = () => {
  return (
    <View style={styles.emptyDayBox}>
      <View style={styles.iconCircle}>
        <Ionicons name="time-outline" size={32} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyDayTitle}>Không có ca làm trong ngày này</Text>
      <Text style={styles.emptyDaySubtitle}>
        Bạn có thể chọn ngày khác trên thanh thứ hoặc nghỉ ngơi nạp năng lượng!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyDayBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 6,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyDayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyDaySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});

export default EmptyShiftState;
