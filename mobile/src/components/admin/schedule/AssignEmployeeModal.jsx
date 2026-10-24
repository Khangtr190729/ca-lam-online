import React from 'react';
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

export const AssignEmployeeModal = ({
  visible,
  onClose,
  targetShift,
  members = [],
  onSelectMember,
}) => {
  if (!targetShift) return null;

  const currentAssignedIds = new Set(
    (targetShift.assignments || []).map((a) => a.userId?._id || a.userId || a.id)
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Thêm nhân viên vào ca</Text>
              <Text style={styles.subtitle}>
                {targetShift.shiftName || targetShift.shift?.name} ({targetShift.startTime} — {targetShift.endTime})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.listLabel}>Chọn nhân viên trong danh sách:</Text>

          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {members.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có nhân viên nào trong quán.</Text>
            ) : (
              members.map((member) => {
                const isAssigned = currentAssignedIds.has(member.userId?._id || member.userId);

                return (
                  <TouchableOpacity
                    key={member._id || member.userId?._id}
                    style={[
                      styles.memberItem,
                      isAssigned && styles.memberItemDisabled,
                    ]}
                    onPress={() => !isAssigned && onSelectMember(member)}
                    disabled={isAssigned}
                    activeOpacity={0.7}
                  >
                    <View style={styles.memberLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {(member.userId?.fullName || 'N').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.memberName}>
                          {member.userId?.fullName || 'Nhân viên'}
                        </Text>
                        <Text style={styles.memberRole}>
                          {member.employmentType === 'FULL_TIME' ? 'Full-time' : 'Part-time'} • {member.userId?.email}
                        </Text>
                      </View>
                    </View>

                    {isAssigned ? (
                      <View style={styles.assignedTag}>
                        <Text style={styles.assignedTagText}>Đã có trong ca</Text>
                      </View>
                    ) : (
                      <View style={styles.addIcon}>
                        <Ionicons name="add" size={18} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
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
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '75%',
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
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  listLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  listScroll: {
    maxHeight: 340,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  memberItemDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  memberRole: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  assignedTag: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  assignedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default AssignEmployeeModal;
