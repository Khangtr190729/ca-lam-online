import React, { useState, useEffect } from 'react';
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
import CustomInput from '../../CustomInput';
import CustomButton from '../../CustomButton';

export const EditMemberWageModal = ({
  visible,
  onClose,
  member,
  onSave,
  saving = false,
}) => {
  const [wage, setWage] = useState('');
  const [employmentType, setEmploymentType] = useState('PART_TIME');

  useEffect(() => {
    if (member) {
      setWage(String(member.hourlyWage || 25000));
      setEmploymentType(member.roleInStore || 'PART_TIME');
    }
  }, [member]);

  const handleSave = () => {
    const parsedWage = Number(wage);
    onSave(member, parsedWage, employmentType);
  };

  if (!member) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Cập nhật nhân viên</Text>
              <Text style={styles.subtitle}>
                {member.userId?.fullName || 'Nhân viên'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Role selector */}
          <Text style={styles.label}>Chế độ làm việc:</Text>
          <View style={styles.pillsRow}>
            <TouchableOpacity
              style={[
                styles.pill,
                employmentType === 'FULL_TIME' && styles.pillActive,
              ]}
              onPress={() => setEmploymentType('FULL_TIME')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  employmentType === 'FULL_TIME' && styles.pillTextActive,
                ]}
              >
                Full-time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pill,
                employmentType === 'PART_TIME' && styles.pillActive,
              ]}
              onPress={() => setEmploymentType('PART_TIME')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  employmentType === 'PART_TIME' && styles.pillTextActive,
                ]}
              >
                Part-time
              </Text>
            </TouchableOpacity>
          </View>

          {/* Wage Input */}
          <CustomInput
            label="Mức lương theo giờ (VNĐ/giờ)"
            value={wage}
            onChangeText={setWage}
            keyboardType="number-pad"
            placeholder="25000"
            leftIcon={
              <Ionicons name="cash-outline" size={18} color={colors.primary} />
            }
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <CustomButton
              title="Lưu thay đổi"
              onPress={handleSave}
              loading={saving}
              style={styles.saveBtn}
            />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF7ED',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.primaryDark,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1.6,
  },
});

export default EditMemberWageModal;
