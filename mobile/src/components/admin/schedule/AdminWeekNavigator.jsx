import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';

export const AdminWeekNavigator = ({
  week,
  year,
  status = 'DRAFT',
  onPrevWeek,
  onNextWeek,
  onToday,
  isCurrentWeek,
  onOpenAutoSchedule,
  onPublish,
  publishing,
}) => {
  const isPublished = status === 'PUBLISHED';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={onPrevWeek}
            style={styles.arrowBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.weekBox}>
            <Text style={styles.weekText}>Tuần {week}, {year}</Text>
          </View>

          <TouchableOpacity
            onPress={onNextWeek}
            style={styles.arrowBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>

          {!isCurrentWeek && (
            <TouchableOpacity
              onPress={onToday}
              style={styles.todayBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.todayText}>Hôm nay</Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            styles.statusBadge,
            isPublished ? styles.badgePublished : styles.badgeDraft,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isPublished ? styles.textPublished : styles.textDraft,
            ]}
          >
            {isPublished ? 'ĐÃ XUẤT BẢN' : 'BẢN NHÁP'}
          </Text>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.autoBtn}
          onPress={onOpenAutoSchedule}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={15} color="#FFFFFF" />
          <Text style={styles.autoBtnText}>Xếp ca tự động</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.publishBtn, isPublished && styles.publishBtnDisabled]}
          onPress={onPublish}
          disabled={publishing || isPublished}
          activeOpacity={0.8}
        >
          <Ionicons
            name="paper-plane-outline"
            size={15}
            color={isPublished ? '#94A3B8' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.publishBtnText,
              isPublished && styles.publishBtnTextDisabled,
            ]}
          >
            {publishing ? 'Đang gửi...' : isPublished ? 'Đã xuất bản' : 'Xuất bản & Gửi Email'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  weekText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  todayBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgePublished: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgeDraft: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textPublished: {
    color: colors.success,
  },
  textDraft: {
    color: '#D97706',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  autoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  autoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  publishBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  publishBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  publishBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  publishBtnTextDisabled: {
    color: '#94A3B8',
  },
});

export default AdminWeekNavigator;
