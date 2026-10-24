import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

export const WeekNavigator = ({
  week,
  year,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
  onToday,
}) => {
  return (
    <View style={styles.weekNavigator}>
      <TouchableOpacity
        onPress={onPrevWeek}
        style={styles.navArrowBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.weekDisplayBox}>
        <Ionicons name="calendar-outline" size={14} color={colors.primary} />
        <Text style={styles.weekDisplayText}>Tuần {week}, {year}</Text>
      </View>

      <TouchableOpacity
        onPress={onNextWeek}
        style={styles.navArrowBtn}
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
          <Text style={styles.todayBtnText}>Hôm nay</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  weekDisplayText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  todayBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default WeekNavigator;
