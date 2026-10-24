import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { formatVND } from '../../../utils/formatters';

export const AdminShiftSlotCard = ({
  shiftItem,
  onAssignEmployee,
  onRemoveEmployee,
  onEvaluateEmployee,
  isPublished = false,
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
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.assignedTitle}>
            Nhân viên phân công ({assignments.length}):
          </Text>
          {isPublished && (
            <Text style={styles.hintEvaluationText}>
              Chạm vào nhân viên để đánh giá chuyên cần
            </Text>
          )}
        </View>

        <View style={styles.chipsWrap}>
          {assignments.map((assign, idx) => {
            const empName =
              assign.userId?.fullName || assign.userName || assign.fullName || 'Nhân viên';
            const empId = assign.userId?._id || assign.userId || assign.id;
            const isMissed = assign.attendanceStatus === 'MISSED';
            const isPartial = assign.attendanceStatus === 'PARTIAL';

            return (
              <TouchableOpacity
                key={empId || idx}
                style={[
                  styles.employeeChip,
                  isMissed && styles.chipMissed,
                  isPartial && styles.chipPartial,
                ]}
                onPress={() => onEvaluateEmployee && onEvaluateEmployee(shiftItem, assign)}
                activeOpacity={0.8}
              >
                <View style={styles.chipContent}>
                  <Ionicons
                    name={
                      isMissed
                        ? 'close-circle'
                        : isPartial
                        ? 'alert-circle'
                        : 'person-circle'
                    }
                    size={16}
                    color={
                      isMissed
                        ? colors.danger
                        : isPartial
                        ? '#D97706'
                        : colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.employeeChipName,
                      isMissed && styles.nameMissed,
                    ]}
                  >
                    {empName}
                  </Text>

                  {/* Status badges */}
                  {isMissed && (
                    <View style={styles.missedTag}>
                      <Text style={styles.missedTagText}>Vắng (-100%)</Text>
                    </View>
                  )}
                  {isPartial && (
                    <View style={styles.partialTag}>
                      <Text style={styles.partialTagText}>
                        -{formatVND(assign.deductedPay || 0)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions inside chip */}
                <View style={styles.chipActions}>
                  {onEvaluateEmployee && (
                    <TouchableOpacity
                      onPress={() => onEvaluateEmployee(shiftItem, assign)}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      style={styles.actionBtn}
                      title="Đánh giá ca"
                    >
                      <Ionicons
                        name="create-outline"
                        size={15}
                        color={isPartial ? '#D97706' : isMissed ? colors.danger : colors.primary}
                      />
                    </TouchableOpacity>
                  )}

                  {!isPublished && (
                    <TouchableOpacity
                      onPress={() => onRemoveEmployee(shiftItem, empId)}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 6 }}
                      style={styles.actionBtn}
                      title="Xóa khỏi ca"
                    >
                      <Ionicons name="close-circle" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add Employee Button (only if not published or if owner wants to add) */}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  hintEvaluationText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  employeeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 8,
  },
  chipMissed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  chipPartial: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  employeeChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  nameMissed: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  missedTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  missedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.danger,
  },
  partialTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  partialTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
  },
  chipActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  actionBtn: {
    padding: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default AdminShiftSlotCard;
