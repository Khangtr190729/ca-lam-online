import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import { formatVND } from '../../../utils/formatters';

export const MemberCardItem = ({
  member,
  onEdit,
  onDelete,
}) => {
  const isFullTime = member.roleInStore === 'FULL_TIME';
  const name = member.userId?.fullName || 'Nhân viên';
  const email = member.userId?.email || '';
  const initial = name.charAt(0).toUpperCase();
  const hourlyWage = member.hourlyWage || 0;
  const gender = member.userId?.gender || 'Nam';
  const age = member.userId?.age || '';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.memberLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.memberName}>{name}</Text>
            <Text style={styles.memberEmail}>{email}</Text>
            <Text style={styles.memberMeta}>
              {gender} {age ? `• ${age} tuổi` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.roleTag}>
          <Text style={styles.roleTagText}>
            {isFullTime ? 'Full-time' : 'Part-time'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.wageBox}>
          <Text style={styles.wageLabel}>Lương cơ bản:</Text>
          <Text style={styles.wageValue}>{formatVND(hourlyWage)}/h</Text>
        </View>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEdit(member)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={14} color={colors.primary} />
            <Text style={styles.editBtnText}>Sửa lương</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDelete(member)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={colors.danger} />
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  nameBlock: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  memberEmail: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wageLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  wageValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.success,
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
});

export default MemberCardItem;
