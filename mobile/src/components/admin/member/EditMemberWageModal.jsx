import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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
  const [roleInStore, setRoleInStore] = useState('EMPLOYEE');

  useEffect(() => {
    if (member) {
      setWage(String(member.hourlyWage || 25000));
      setEmploymentType(member.employmentType || 'PART_TIME');
      setRoleInStore(member.roleInStore || 'EMPLOYEE');
    }
  }, [member, visible]);

  const handleSave = () => {
    const parsedWage = Number(wage) || 20000;
    onSave(member, parsedWage, employmentType, roleInStore);
  };

  if (!member) return null;

  const memberName = member.userId?.fullName || member.fullName || 'Nhân viên';

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
            <View>
              <Text style={styles.title}>Cập nhật nhân viên</Text>
              <Text style={styles.subtitle}>{memberName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 1. Chức vụ trong quán (Quản lý vs Nhân viên) */}
            <Text style={styles.label}>Chức vụ trong quán:</Text>
            <View style={styles.pillsRow}>
              <TouchableOpacity
                style={[
                  styles.pill,
                  roleInStore === 'EMPLOYEE' && styles.pillActive,
                ]}
                onPress={() => setRoleInStore('EMPLOYEE')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="person"
                  size={14}
                  color={roleInStore === 'EMPLOYEE' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.pillText,
                    roleInStore === 'EMPLOYEE' && styles.pillTextActive,
                  ]}
                >
                  Nhân viên
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pill,
                  roleInStore === 'MANAGER' && styles.pillActiveManager,
                ]}
                onPress={() => setRoleInStore('MANAGER')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={roleInStore === 'MANAGER' ? '#1D4ED8' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.pillText,
                    roleInStore === 'MANAGER' && styles.pillTextActiveManager,
                  ]}
                >
                  Quản lý quán
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Chế độ làm việc (Full-time vs Part-time) */}
            <Text style={styles.label}>Chế độ làm việc:</Text>
            <View style={styles.pillsRow}>
              <TouchableOpacity
                style={[
                  styles.pill,
                  employmentType === 'FULL_TIME' && styles.pillActivePurple,
                ]}
                onPress={() => setEmploymentType('FULL_TIME')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    employmentType === 'FULL_TIME' && styles.pillTextActivePurple,
                  ]}
                >
                  Toàn thời gian (Full-time)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pill,
                  employmentType === 'PART_TIME' && styles.pillActiveAmber,
                ]}
                onPress={() => setEmploymentType('PART_TIME')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    employmentType === 'PART_TIME' && styles.pillTextActiveAmber,
                  ]}
                >
                  Bán thời gian (Part-time)
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3. Wage Input */}
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

            {/* Actions */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>

              <View style={styles.saveBtnWrap}>
                <CustomButton
                  title={saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  onPress={handleSave}
                  loading={saving}
                  size="small"
                />
              </View>
            </View>
          </ScrollView>
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
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pillActiveManager: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  pillActivePurple: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  pillActiveAmber: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  pillTextActiveManager: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  pillTextActivePurple: {
    color: '#6D28D9',
    fontWeight: '800',
  },
  pillTextActiveAmber: {
    color: '#B45309',
    fontWeight: '800',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveBtnWrap: {
    minWidth: 120,
  },
});

export default EditMemberWageModal;
