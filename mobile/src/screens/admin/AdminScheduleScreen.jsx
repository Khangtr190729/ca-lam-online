import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { scheduleApi, memberApi, shiftApi } from '../../services/api';
import colors from '../../theme/colors';
import {
  getMondayOfWeek,
  getDaysOfWeek,
  addWeeks,
  formatDateToISO,
  getWeekNumberAndYear,
} from '../../utils/formatters';

import AdminWeekNavigator from '../../components/admin/schedule/AdminWeekNavigator';
import AdminDayStrip from '../../components/admin/schedule/AdminDayStrip';
import AdminShiftSlotCard from '../../components/admin/schedule/AdminShiftSlotCard';
import AutoScheduleModal from '../../components/admin/schedule/AutoScheduleModal';
import AssignEmployeeModal from '../../components/admin/schedule/AssignEmployeeModal';
import PayrollSummaryCard from '../../components/admin/schedule/PayrollSummaryCard';
import ShiftEvaluationModal from '../../components/admin/schedule/ShiftEvaluationModal';

export const AdminScheduleScreen = () => {
  const { store } = useAuth();
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek());
  const [selectedDate, setSelectedDate] = useState(() => formatDateToISO(new Date()));
  const [schedule, setSchedule] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [storeShifts, setStoreShifts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoModalVisible, setAutoModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedShiftForAssign, setSelectedShiftForAssign] = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Shift Evaluation State
  const [evalModalVisible, setEvalModalVisible] = useState(false);
  const [selectedAssignForEval, setSelectedAssignForEval] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const daysOfWeek = useMemo(() => getDaysOfWeek(currentMonday), [currentMonday]);
  const { week, year } = useMemo(() => getWeekNumberAndYear(currentMonday), [currentMonday]);
  const currentWeekNumber = useMemo(() => getWeekNumberAndYear(new Date()).week, []);

  // Helper getters
  const getShiftId = (shift) => (typeof shift === 'object' && shift !== null ? shift._id : shift);
  const getUserId = (user) => (typeof user === 'object' && user !== null ? user._id : user);

  // Load Schedule, Shifts, and Members
  const loadScheduleData = useCallback(async (isRefresh = false) => {
    if (!store?._id) return;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [schedRes, shiftsRes, membersRes] = await Promise.all([
        scheduleApi.getWeeklySchedule(store._id, week, year).catch(() => null),
        shiftApi.getShifts(store._id).catch(() => null),
        memberApi.getMembers(store._id).catch(() => null),
      ]);

      if (schedRes?.success && schedRes.hasSchedule && schedRes.schedule) {
        setSchedule(schedRes.schedule);
        setAssignments(schedRes.schedule.assignments || []);
      } else {
        setSchedule(null);
        setAssignments([]);
      }

      if (shiftsRes?.success) {
        setStoreShifts(shiftsRes.shifts || shiftsRes.data || []);
      }

      if (membersRes?.success) {
        setMembers(membersRes.members || []);
      }
    } catch (err) {
      console.warn('Error loading admin schedule:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store?._id, week, year]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Navigate weeks
  const handlePrevWeek = () => setCurrentMonday((prev) => addWeeks(prev, -1));
  const handleNextWeek = () => setCurrentMonday((prev) => addWeeks(prev, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonday(getMondayOfWeek(today));
    setSelectedDate(formatDateToISO(today));
  };

  // Shifts for selected date (combining store shift templates with assignments)
  const shiftsForDay = useMemo(() => {
    return storeShifts.map((s) => {
      const sId = (s._id || '').toString();
      const dayAssignments = assignments.filter((a) => {
        const aShiftId = (getShiftId(a.shiftId) || '').toString();
        return a.date === selectedDate && aShiftId === sId;
      });

      return {
        shiftId: s._id,
        shiftName: s.name,
        startTime: s.startTime,
        endTime: s.endTime,
        durationHours: s.durationHours,
        peakLevel: s.peakLevel,
        color: s.color,
        date: selectedDate,
        assignments: dayAssignments,
      };
    });
  }, [storeShifts, assignments, selectedDate]);

  // Compute Weekly Payroll Summary
  const payrollSummary = useMemo(() => {
    const employeeMap = {};

    members.forEach((m) => {
      const uId = getUserId(m.userId?._id || m.userId || m.user?._id);
      if (!uId) return;
      const uName = m.userId?.fullName || m.fullName || m.name || 'Nhân viên';
      employeeMap[uId] = {
        userId: uId,
        name: uName,
        email: m.userId?.email || '',
        hourlyWage: m.hourlyWage || 20000,
        totalHours: 0,
        totalShifts: 0,
        completedShifts: 0,
        partialShifts: 0,
        missedShifts: 0,
        totalWage: 0,
      };
    });

    assignments.forEach((a) => {
      const uId = getUserId(a.userId);
      const sId = getShiftId(a.shiftId);
      const shift = storeShifts.find((s) => getShiftId(s._id) === sId);
      const hours = a.hours || shift?.durationHours || 4;
      const wage = a.hourlyWage || employeeMap[uId]?.hourlyWage || 20000;
      const fullPay = Math.round(hours * wage);

      if (!employeeMap[uId]) {
        const uName =
          (typeof a.userId === 'object' && a.userId !== null
            ? a.userId.fullName || a.userId.name
            : '') || 'Nhân viên';
        employeeMap[uId] = {
          userId: uId,
          name: uName,
          email: '',
          hourlyWage: wage,
          totalHours: 0,
          totalShifts: 0,
          completedShifts: 0,
          partialShifts: 0,
          missedShifts: 0,
          totalWage: 0,
        };
      }

      employeeMap[uId].totalShifts += 1;

      if (a.attendanceStatus === 'MISSED') {
        employeeMap[uId].missedShifts += 1;
      } else if (a.attendanceStatus === 'PARTIAL') {
        employeeMap[uId].partialShifts += 1;
        employeeMap[uId].completedShifts += 1;
        const effectiveHours = Math.max(0, hours - (a.deductedHours || 0));
        employeeMap[uId].totalHours += effectiveHours;
        const shiftPay = a.totalPay !== undefined ? a.totalPay : Math.max(0, fullPay - (a.deductedPay || 0));
        employeeMap[uId].totalWage += shiftPay;
      } else {
        employeeMap[uId].completedShifts += 1;
        employeeMap[uId].totalHours += hours;
        const shiftPay = a.totalPay !== undefined ? a.totalPay : fullPay;
        employeeMap[uId].totalWage += shiftPay;
      }
    });

    let storeTotalPayroll = 0;
    let storeTotalHours = 0;
    let storeTotalShifts = assignments.length;
    let storeTotalMissedShifts = 0;
    let storeTotalPartialShifts = 0;

    const list = Object.values(employeeMap)
      .filter((e) => e.totalShifts > 0)
      .map((e) => {
        storeTotalPayroll += e.totalWage;
        storeTotalHours += e.totalHours;
        storeTotalMissedShifts += e.missedShifts;
        storeTotalPartialShifts += e.partialShifts;
        return e;
      });

    return {
      employees: list,
      storeTotalPayroll,
      storeTotalHours,
      storeTotalShifts,
      storeTotalMissedShifts,
      storeTotalPartialShifts,
    };
  }, [members, assignments, storeShifts]);

  // Handle Run Auto Schedule
  const handleRunAutoSchedule = async (config) => {
    if (!store?._id) return;
    try {
      setAutoLoading(true);
      const payload = {
        week,
        year,
        startDate: daysOfWeek[0].dateStr,
        endDate: daysOfWeek[6].dateStr,
        days: daysOfWeek.map((d) => ({
          date: d.dateStr,
          dayOfWeek: d.dayName,
        })),
        staffPerShift: config.staffPerShift || 'AUTO_BY_STARS',
        maxShiftsPerDay: config.maxShiftsPerDay || 1,
        preserveExisting: Boolean(config.preserveExisting),
        existingAssignments: assignments,
      };

      const res = await scheduleApi.autoGenerate(store._id, payload);
      setAutoModalVisible(false);
      Alert.alert('Thành công', res.message || 'Đã tự động xếp ca xong (Lưu bản nháp)!');
      await loadScheduleData();
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể xếp ca tự động.');
    } finally {
      setAutoLoading(false);
    }
  };

  // Handle Publish Schedule
  const handlePublish = async () => {
    if (!store?._id) return;
    Alert.alert(
      'Xuất bản lịch làm việc',
      `Bạn có chắc chắn muốn xuất bản lịch làm Tuần ${week}/${year} và gửi email thông báo tới toàn bộ nhân viên?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xuất bản ngay',
          onPress: async () => {
            try {
              setPublishing(true);
              const res = await scheduleApi.publishSchedule(store._id, { week, year });
              Alert.alert('Thành công', res.message || 'Xuất bản lịch thành công!');
              await loadScheduleData();
            } catch (err) {
              Alert.alert('Lỗi', err.message || 'Xuất bản thất bại.');
            } finally {
              setPublishing(false);
            }
          },
        },
      ]
    );
  };

  // Handle Assign Employee
  const handleSelectMemberToAssign = async (member) => {
    if (!selectedShiftForAssign || !store?._id) return;

    const dayObj = daysOfWeek.find((d) => d.dateStr === selectedShiftForAssign.date);
    const uId = member.userId?._id || member.userId;
    const uName = member.userId?.fullName || member.fullName || 'Nhân viên';
    const wage = member.hourlyWage || 20000;
    const hours = selectedShiftForAssign.durationHours || 4;

    const newAssignment = {
      date: selectedShiftForAssign.date,
      dayOfWeek: dayObj?.dayName || 'Thứ Hai',
      shiftId: selectedShiftForAssign.shiftId,
      userId: uId,
      hours,
      hourlyWage: wage,
      totalPay: Math.round(hours * wage),
      attendanceStatus: 'COMPLETED',
      penaltyType: 'NONE',
      deductedHours: 0,
      deductedPay: 0,
    };

    const updatedAssignments = [...assignments, newAssignment];

    try {
      setAssignModalVisible(false);
      await scheduleApi.saveDraft(store._id, {
        week,
        year,
        startDate: daysOfWeek[0].dateStr,
        endDate: daysOfWeek[6].dateStr,
        assignments: updatedAssignments,
      });
      await loadScheduleData();
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể gán nhân viên vào ca.');
    }
  };

  // Handle Remove Employee from Shift
  const handleRemoveEmployee = async (shiftItem, empId) => {
    if (!store?._id) return;

    const updatedAssignments = assignments.filter((a) => {
      const aShiftId = (getShiftId(a.shiftId) || '').toString();
      const aUserId = (getUserId(a.userId) || '').toString();
      const targetShiftId = (shiftItem.shiftId || '').toString();
      const targetUserId = (empId || '').toString();
      return !(a.date === shiftItem.date && aShiftId === targetShiftId && aUserId === targetUserId);
    });

    try {
      await scheduleApi.saveDraft(store._id, {
        week,
        year,
        startDate: daysOfWeek[0].dateStr,
        endDate: daysOfWeek[6].dateStr,
        assignments: updatedAssignments,
      });
      await loadScheduleData();
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể xóa nhân viên khỏi ca.');
    }
  };

  // Handle Open Shift Evaluation Modal
  const handleOpenEvaluate = (shiftItem, assign) => {
    const uId = getUserId(assign.userId);
    const uName =
      (typeof assign.userId === 'object' && assign.userId !== null
        ? assign.userId.fullName || assign.userId.name
        : '') ||
      assign.userName ||
      assign.fullName ||
      'Nhân viên';

    setSelectedAssignForEval({
      shiftId: getShiftId(assign.shiftId) || shiftItem.shiftId,
      shiftName: shiftItem.shiftName,
      date: assign.date || shiftItem.date,
      userId: uId,
      userName: uName,
      hourlyWage: assign.hourlyWage || 20000,
      hours: assign.hours || shiftItem.durationHours || 4,
      attendanceStatus: assign.attendanceStatus || 'COMPLETED',
      deductedHours: assign.deductedHours || 0,
      deductedPay: assign.deductedPay || 0,
      penaltyType: assign.penaltyType || 'HOURS',
      missedReason: assign.missedReason || '',
    });
    setEvalModalVisible(true);
  };

  // Handle Save Evaluation
  const handleSaveEvaluation = async (evalData) => {
    if (!store?._id) return;
    try {
      setEvaluating(true);
      const res = await scheduleApi.evaluateShift(store._id, {
        week,
        year,
        weekStart: currentMonday,
        date: evalData.date,
        shiftId: evalData.shiftId,
        userId: evalData.userId,
        attendanceStatus: evalData.attendanceStatus,
        missedReason: evalData.missedReason,
        deductedHours: evalData.deductedHours,
        deductedPay: evalData.deductedPay,
        penaltyType: evalData.penaltyType,
      });

      if (res?.success) {
        setEvalModalVisible(false);
        Alert.alert('Thành công', 'Đã lưu kết quả đánh giá ca làm việc!');
        await loadScheduleData();
      }
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể đánh giá ca làm việc.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadScheduleData(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quản lý xếp ca tuần</Text>
          <Text style={styles.subtitle}>
            Điều chỉnh ca làm, phân công nhân viên và gửi thông báo lịch trực
          </Text>
        </View>

        {/* 1. Week Navigator */}
        <AdminWeekNavigator
          week={week}
          year={year}
          status={schedule?.status || 'DRAFT'}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onToday={handleToday}
          isCurrentWeek={week === currentWeekNumber}
          onOpenAutoSchedule={() => setAutoModalVisible(true)}
          onPublish={handlePublish}
          publishing={publishing}
        />

        {/* 2. Payroll Summary Card */}
        <PayrollSummaryCard payrollSummary={payrollSummary} />

        {/* 3. 7-Day Strip */}
        <AdminDayStrip
          daysOfWeek={daysOfWeek}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
        />

        {/* Loading Spinner */}
        {loading && !refreshing && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Đang cập nhật lịch ca...</Text>
          </View>
        )}

        {/* 4. Shifts List */}
        <View style={styles.shiftsList}>
          <Text style={styles.sectionHeader}>
            DANH SÁCH CA NGÀY {selectedDate}
          </Text>

          {shiftsForDay.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có ca làm nào trong ngày này</Text>
              <Text style={styles.emptyDesc}>
                Vào mục "Ca làm" để tạo các khung giờ làm việc cho quán.
              </Text>
            </View>
          ) : (
            shiftsForDay.map((shift, idx) => (
              <AdminShiftSlotCard
                key={shift.shiftId || idx}
                shiftItem={shift}
                isPublished={schedule?.status === 'PUBLISHED'}
                onAssignEmployee={(s) => {
                  setSelectedShiftForAssign(s);
                  setAssignModalVisible(true);
                }}
                onRemoveEmployee={handleRemoveEmployee}
                onEvaluateEmployee={handleOpenEvaluate}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Auto Schedule Modal */}
      <AutoScheduleModal
        visible={autoModalVisible}
        onClose={() => setAutoModalVisible(false)}
        onRunAutoSchedule={handleRunAutoSchedule}
        loading={autoLoading}
      />

      {/* Assign Employee Modal */}
      <AssignEmployeeModal
        visible={assignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        targetShift={selectedShiftForAssign}
        members={members}
        onSelectMember={handleSelectMemberToAssign}
      />

      {/* Shift Evaluation Modal */}
      <ShiftEvaluationModal
        visible={evalModalVisible}
        onClose={() => setEvalModalVisible(false)}
        targetAssignment={selectedAssignForEval}
        onSaveEvaluation={handleSaveEvaluation}
        loading={evaluating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  shiftsList: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AdminScheduleScreen;
