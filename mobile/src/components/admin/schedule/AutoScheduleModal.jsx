import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';

export const AutoScheduleModal = ({
  visible,
  onClose,
  onRunAutoSchedule,
  loading = false,
}) => {
  const [priorityMode, setPriorityMode] = useState('FULL_TIME'); // 'FULL_TIME' | 'BALANCED'

  const handleConfirm = () => {
    onRunAutoSchedule(priorityMode);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={24} color={colors.primary} />
            </View>
            <Text style={styles.title}>Tự động xếp ca làm việc</Text>
            <Text style={styles.subtitle}>
              Hệ thống sẽ tự động phân bổ nhân viên vào tất cả các ca trong tuần.
            </Text>
          </View>

          {/* Options */}
          <Text style={styles.optionsLabel}>Chọn thuật toán phân bổ:</Text>

          <TouchableOpacity
            style={[
              styles.optionCard,
              priorityMode === 'FULL_TIME' && styles.optionCardSelected,
            ]}
            onPress={() => setPriorityMode('FULL_TIME')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                priorityMode === 'FULL_TIME'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color={priorityMode === 'FULL_TIME' ? colors.primary : colors.textMuted}
            />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Ưu tiên nhân viên Full-time</Text>
              <Text style={styles.optionDesc}>
                Phân bổ đủ chỉ tiêu giờ làm cho nhân viên toàn thời gian trước.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              priorityMode === 'BALANCED' && styles.optionCardSelected,
            ]}
            onPress={() => setPriorityMode('BALANCED')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                priorityMode === 'BALANCED'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color={priorityMode === 'BALANCED' ? colors.primary : colors.textMuted}
            />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Xếp đều cho tất cả nhân viên</Text>
              <Text style={styles.optionDesc}>
                Chia đều số lượng ca và số giờ làm giữa các nhân viên trong quán.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Action buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Đóng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                  <Text style={styles.confirmText}>Bắt đầu xếp ca</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF7ED',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  optionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default AutoScheduleModal;
