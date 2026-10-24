import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';

export const AdminShiftSlotCard = ({
  shiftItem,
  onAssignEmployee,
  onRemoveEmployee,
}) => {
  const shiftName = shiftItem.shiftName || shiftItem.shift?.name || 'Ca làm';
  const startTime = shiftItem.startTime || shiftItem.shift?.startTime || '';
  const endTime = shiftItem.endTime || shiftItem.shift?.endTime || '';
  const duration = shiftItem.durationHours || shiftItem.shift?.durationHours || shiftItem.hours || 0;
  const peakLevel = shiftItem.peakLevel || shiftItem.shift?.peakLevel || 1;
  const assignments = shiftItem.assignments || [];

  const getPeakStars = () => {
    switch (peakLevel) {
      case 3:
        return '⭐⭐⭐ Rất cao điểm';
      case 2:
        return '⭐⭐ Cao điểm';
      case 1:
      default:
        return '⭐ Bình thường';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.shiftName}>{shiftName}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={13} color={colors.primary} />
            <Text style={styles.timeText}>
              {startTime} — {endTime} ({duration}h)
            </Text>
          </View>
        </View>

        <View style={styles.peakBadge}>
          <Text style={styles.peakText}>{getPeakStars()}</Text>
        </View>
      </View>

      {/* Assigned Employees List */}
      <View style={styles.employeesSection}>
        <Text style={styles.assignedTitle}>
          Nhân viên phân công ({assignments.length}):
        </Text>

        <View style={styles.chipsWrap}>
          {assignments.map((assign, idx) => {
            const empName = assign.userId?.fullName || assign.userName || assign.fullName || 'Nhân viên';
            const empId = assign.userId?._id || assign.userId || assign.id;

            return (
              <View key={empId || idx} style={styles.employeeChip}>
                <Ionicons name="person-circle" size={16} color={colors.primary} />
                <Text style={styles.employeeChipName}>{empName}</Text>
                <TouchableOpacity
                  onPress={() => onRemoveEmployee(shiftItem, empId)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.removeChipBtn}
                >
                  <Ionicons name="close-circle" size={15} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Add Employee Button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAssignEmployee(shiftItem)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={15} color={colors.primary} />
            <Text style={styles.addBtnText}>Thêm nhân viên</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  peakBadge: {
    backgroundColor: '#FFFBEB',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  peakText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  employeesSection: {
    marginTop: 2,
  },
  assignedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  employeeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  employeeChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  removeChipBtn: {
    paddingLeft: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default AdminShiftSlotCard;
