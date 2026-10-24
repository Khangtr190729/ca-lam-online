import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { scheduleApi } from '../services/api';
import colors from '../theme/colors';
import {
  getMondayOfWeek,
  getDaysOfWeek,
  addWeeks,
  formatWeekRange,
  formatDateToISO,
  getWeekNumberAndYear,
  formatVND,
} from '../utils/formatters';
import ShiftDetailModal from '../components/ShiftDetailModal';

export const MyScheduleScreen = () => {
  const { user, store } = useAuth();

  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek());
  const [selectedDate, setSelectedDate] = useState(() => formatDateToISO(new Date()));
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeShiftDetail, setActiveShiftDetail] = useState(null);

  const daysOfWeek = useMemo(() => getDaysOfWeek(currentMonday), [currentMonday]);
  const { week, year } = useMemo(() => getWeekNumberAndYear(currentMonday), [currentMonday]);
  const currentWeekNumber = useMemo(() => getWeekNumberAndYear(new Date()).week, []);

  // Fetch schedule
  const loadSchedule = useCallback(async (isRefresh = false) => {
    if (!store) return;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await scheduleApi.getMySchedule(week, year);
      if (res && res.success) {
        setScheduleData({
          shifts: res.shifts || [],
          stats: {
            totalShifts: res.shifts?.length || 0,
            totalHours: res.totalHours || 0,
            hourlyWage: res.hourlyWage || 0,
            estimatedWage: res.totalSalary || 0,
          },
        });
      } else {
        setScheduleData(null);
      }
    } catch (err) {
      console.warn('Error loading schedule:', err.message);
      setScheduleData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store, week, year]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Navigate weeks
  const handlePrevWeek = () => {
    setCurrentMonday((prev) => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentMonday((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonday(getMondayOfWeek(today));
    setSelectedDate(formatDateToISO(today));
  };

  // Filter shifts for the selected date
  const shiftsForSelectedDate = useMemo(() => {
    if (!scheduleData?.shifts) return [];
    return scheduleData.shifts.filter((s) => s.date === selectedDate);
  }, [scheduleData, selectedDate]);

  // Find next upcoming shift
  const nextUpcomingShift = useMemo(() => {
    if (!scheduleData?.shifts || scheduleData.shifts.length === 0) return null;
    const todayISO = formatDateToISO(new Date());
    const upcoming = scheduleData.shifts.find((s) => s.date >= todayISO);
    return upcoming || scheduleData.shifts[0];
  }, [scheduleData]);

  // Map shift dates to check if a day has shifts
  const shiftDatesSet = useMemo(() => {
    const set = new Set();
    if (scheduleData?.shifts) {
      scheduleData.shifts.forEach((s) => set.add(s.date));
    }
    return set;
  }, [scheduleData]);

  const selectedDayInfo = useMemo(() => {
    return daysOfWeek.find((d) => d.dateStr === selectedDate);
  }, [daysOfWeek, selectedDate]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSchedule(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Store & Employee Header */}
        <View style={styles.topHeader}>
          <View style={styles.storeBadge}>
            <Ionicons name="storefront" size={14} color={colors.primary} />
            <Text style={styles.storeName}>{store?.name || 'Cửa hàng'}</Text>
          </View>
          <Text style={styles.greetingTitle}>
            Xin chào, {user?.fullName || 'nhân viên'}! 👋
          </Text>
          <Text style={styles.weekRangeText}>
            Tuần {week}/{year} • {formatWeekRange(currentMonday)}
          </Text>
        </View>

        {/* Week Navigator */}
        <View style={styles.weekNavigator}>
          <TouchableOpacity
            onPress={handlePrevWeek}
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
            onPress={handleNextWeek}
            style={styles.navArrowBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>

          {week !== currentWeekNumber && (
            <TouchableOpacity
              onPress={handleToday}
              style={styles.todayBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.todayBtnText}>Hôm nay</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 7-Day Horizontal Date Strip */}
        <View style={styles.dateStrip}>
          {daysOfWeek.map((day) => {
            const isSelected = day.dateStr === selectedDate;
            const hasShift = shiftDatesSet.has(day.dateStr);

            return (
              <TouchableOpacity
                key={day.dateStr}
                style={[
                  styles.dayColumn,
                  isSelected && styles.dayColumnSelected,
                ]}
                onPress={() => setSelectedDate(day.dateStr)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayOfWeekText,
                    isSelected && styles.dayOfWeekTextSelected,
                  ]}
                >
                  {day.dayOfWeek}
                </Text>

                <Text
                  style={[
                    styles.dayNumberText,
                    isSelected && styles.dayNumberTextSelected,
                  ]}
                >
                  {day.dayNumber}
                </Text>

                {/* Dot indicating shifts */}
                <View
                  style={[
                    styles.shiftDot,
                    hasShift && styles.shiftDotActive,
                    isSelected && hasShift && styles.shiftDotSelected,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loading Indicator */}
        {loading && !refreshing && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải lịch làm việc...</Text>
          </View>
        )}

        {/* Estimated Wage Card (Dark Card with Orange Glow) */}
        <View style={styles.wageCard}>
          <View style={styles.wageCardHeader}>
            <View style={styles.wageCardTitleRow}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.wageCardTitle}>BẢNG LƯƠNG ƯỚC TÍNH TUẦN NÀY</Text>
            </View>
            <View style={styles.hourlyRatePill}>
              <Text style={styles.hourlyRateText}>
                {formatVND(scheduleData?.stats?.hourlyWage || 0)}/h
              </Text>
            </View>
          </View>

          <Text style={styles.totalWageAmount}>
            {formatVND(scheduleData?.stats?.estimatedWage || 0)}
          </Text>

          <View style={styles.wageStatsRow}>
            <View style={styles.wageStatCol}>
              <Text style={styles.wageStatLabel}>Số ca đã nhận:</Text>
              <Text style={styles.wageStatValue}>
                {scheduleData?.stats?.totalShifts || 0} ca
              </Text>
            </View>

            <View style={styles.wageStatDivider} />

            <View style={styles.wageStatCol}>
              <Text style={styles.wageStatLabel}>Tổng số giờ làm:</Text>
              <Text style={styles.wageStatValue}>
                {scheduleData?.stats?.totalHours || 0} giờ
              </Text>
            </View>
          </View>
        </View>

        {/* Hero: Next Upcoming Shift Card */}
        {nextUpcomingShift ? (
          <View style={styles.nextShiftCard}>
            <View style={styles.nextShiftHeader}>
              <View style={styles.nextShiftBadge}>
                <Text style={styles.nextShiftBadgeText}>CA LÀM TIẾP THEO</Text>
              </View>
              <Text style={styles.nextShiftDate}>{nextUpcomingShift.date}</Text>
            </View>

            <View style={styles.nextShiftContent}>
              <View style={styles.nextShiftInfo}>
                <Text style={styles.nextShiftName}>
                  {nextUpcomingShift.shift?.name || nextUpcomingShift.shiftName || 'Ca làm việc'}
                </Text>
                <View style={styles.nextShiftTimeRow}>
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                  <Text style={styles.nextShiftTimeText}>
                    {(nextUpcomingShift.shift?.startTime || nextUpcomingShift.startTime)} — {(nextUpcomingShift.shift?.endTime || nextUpcomingShift.endTime)} ({(nextUpcomingShift.shift?.durationHours || nextUpcomingShift.hours)}h)
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => setActiveShiftDetail(nextUpcomingShift)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailButtonText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Selected Day's Shifts Section */}
        <View style={styles.shiftsSection}>
          <Text style={styles.shiftsSectionTitle}>
            LỊCH NGÀY {selectedDayInfo?.fullDisplay || selectedDate}
          </Text>

          {shiftsForSelectedDate.length === 0 ? (
            <View style={styles.emptyDayBox}>
              <Ionicons name="time-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyDayTitle}>Không có ca làm trong ngày này</Text>
              <Text style={styles.emptyDaySubtitle}>
                Bạn có thể chọn ngày khác trên thanh thứ hoặc nghỉ ngơi nạp năng lượng!
              </Text>
            </View>
          ) : (
            shiftsForSelectedDate.map((item, idx) => {
              const isMissed = item.attendanceStatus === 'MISSED';
              const isPartial = item.attendanceStatus === 'PARTIAL';
              const shiftName = item.shift?.name || item.shiftName || 'Ca làm việc';
              const startTime = item.shift?.startTime || item.startTime || '';
              const endTime = item.shift?.endTime || item.endTime || '';
              const hours = item.shift?.durationHours || item.hours || 0;

              return (
                <TouchableOpacity
                  key={item.assignmentId || idx}
                  style={[
                    styles.shiftCard,
                    isMissed && styles.shiftCardMissed,
                    isPartial && styles.shiftCardPartial,
                  ]}
                  onPress={() => setActiveShiftDetail(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.shiftCardLeft}>
                    <View
                      style={[
                        styles.shiftIconBox,
                        isMissed && styles.shiftIconBoxMissed,
                        isPartial && styles.shiftIconBoxPartial,
                      ]}
                    >
                      <Ionicons
                        name="time"
                        size={20}
                        color={
                          isMissed
                            ? colors.danger
                            : isPartial
                            ? '#D97706'
                            : colors.primary
                        }
                      />
                    </View>

                    <View style={styles.shiftDetails}>
                      <View style={styles.shiftNameRow}>
                        <Text
                          style={[
                            styles.shiftCardName,
                            isMissed && styles.shiftCardNameStruck,
                          ]}
                        >
                          {shiftName}
                        </Text>
                        {isMissed && (
                          <View style={styles.missedTag}>
                            <Text style={styles.missedTagText}>Không hoàn thành</Text>
                          </View>
                        )}
                        {isPartial && (
                          <View style={styles.partialTag}>
                            <Text style={styles.partialTagText}>
                              Trừ -{formatVND(item.deductedPay || 0)}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.shiftCardTime}>
                        {startTime} — {endTime} ({hours}h)
                        {isPartial && (
                          <Text style={styles.partialPayText}>
                            {' '}• Nhận: {formatVND(item.totalPay || 0)}
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Coworkers badge */}
                  <View style={styles.coworkerBadge}>
                    <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.coworkerBadgeText}>
                      {item.coworkers?.length || 0} đồng nghiệp
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Shift Detail Modal */}
      <ShiftDetailModal
        visible={!!activeShiftDetail}
        onClose={() => setActiveShiftDetail(null)}
        shiftDetail={activeShiftDetail}
        storeName={store?.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  topHeader: {
    marginBottom: 16,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  storeName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  weekRangeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  navArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weekDisplayText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  todayBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  dateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  dayColumnSelected: {
    backgroundColor: colors.primary,
  },
  dayOfWeekText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayOfWeekTextSelected: {
    color: '#FFFFFF',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
  },
  shiftDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'transparent',
    marginTop: 6,
  },
  shiftDotActive: {
    backgroundColor: colors.primary,
  },
  shiftDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  wageCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  wageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  wageCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wageCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#CBD5E1',
  },
  hourlyRatePill: {
    backgroundColor: 'rgba(234, 112, 27, 0.2)',
    borderColor: 'rgba(234, 112, 27, 0.4)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  hourlyRateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FDBA74',
  },
  totalWageAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  wageStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  wageStatCol: {
    flex: 1,
  },
  wageStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 12,
  },
  wageStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  wageStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  nextShiftCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  nextShiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextShiftBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  nextShiftBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nextShiftDate: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  nextShiftContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextShiftInfo: {
    flex: 1,
  },
  nextShiftName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  nextShiftTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  nextShiftTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  detailButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  shiftsSection: {
    marginBottom: 20,
  },
  shiftsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: 10,
    marginLeft: 2,
  },
  emptyDayBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyDayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  emptyDaySubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  shiftCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  shiftCardMissed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  shiftCardPartial: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  shiftCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shiftIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftIconBoxMissed: {
    backgroundColor: colors.dangerLight,
  },
  shiftIconBoxPartial: {
    backgroundColor: colors.warningLight,
  },
  shiftDetails: {
    flex: 1,
  },
  shiftNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  shiftCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  shiftCardNameStruck: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  missedTag: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  missedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.danger,
  },
  partialTag: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  partialTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
  },
  shiftCardTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  partialPayText: {
    color: '#059669',
    fontWeight: '700',
  },
  coworkerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  coworkerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default MyScheduleScreen;
