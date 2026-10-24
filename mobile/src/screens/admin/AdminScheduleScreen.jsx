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

export const AdminScheduleScreen = () => {
  const { store } = useAuth();
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek());
  const [selectedDate, setSelectedDate] = useState(() => formatDateToISO(new Date()));
  const [schedule, setSchedule] = useState(null);
  const [storeShifts, setStoreShifts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoModalVisible, setAutoModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedShiftForAssign, setSelectedShiftForAssign] = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const daysOfWeek = useMemo(() => getDaysOfWeek(currentMonday), [currentMonday]);
  const { week, year } = useMemo(() => getWeekNumberAndYear(currentMonday), [currentMonday]);
  const currentWeekNumber = useMemo(() => getWeekNumberAndYear(new Date()).week, []);

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

      if (schedRes?.success && schedRes.schedule) {
        setSchedule(schedRes.schedule);
      } else {
        setSchedule(null);
      }

      if (shiftsRes?.success) {
        setStoreShifts(shiftsRes.shifts || []);
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

  // Shifts for selected date
  const shiftsForDay = useMemo(() => {
    if (schedule?.shifts && schedule.shifts.length > 0) {
      const existing = schedule.shifts.filter((s) => s.date === selectedDate);
      if (existing.length > 0) return existing;
    }
    // Fallback: Show store default shift templates for this date
    return storeShifts.map((s) => ({
      shiftId: s._id,
      shiftName: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      durationHours: s.durationHours,
      peakLevel: s.peakLevel,
      date: selectedDate,
      assignments: [],
    }));
  }, [schedule, storeShifts, selectedDate]);

  // Handle Run Auto Schedule
  const handleRunAutoSchedule = async (priorityMode) => {
    if (!store?._id) return;
    try {
      setAutoLoading(true);
      const res = await scheduleApi.autoGenerate(store._id, {
        week,
        year,
        priorityMode,
      });
      setAutoModalVisible(false);
      Alert.alert('Thành công', res.message || 'Đã tự động xếp ca xong!');
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
      `Bạn có chắc chắn muốn xuất bản lịch làm Tuần ${week}/${year} và gửi email tới toàn bộ nhân viên?`,
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

    const currentShifts = schedule?.shifts ? [...schedule.shifts] : [];
    const shiftIdx = currentShifts.findIndex(
      (s) =>
        s.date === selectedShiftForAssign.date &&
        (s.shiftId === selectedShiftForAssign.shiftId || s.shiftName === selectedShiftForAssign.shiftName)
    );

    const newAssignment = {
      userId: member.userId?._id || member.userId,
      userName: member.userId?.fullName || 'Nhân viên',
    };

    if (shiftIdx >= 0) {
      currentShifts[shiftIdx].assignments = [
        ...(currentShifts[shiftIdx].assignments || []),
        newAssignment,
      ];
    } else {
      currentShifts.push({
        ...selectedShiftForAssign,
        assignments: [newAssignment],
      });
    }

    try {
      setAssignModalVisible(false);
      await scheduleApi.saveDraft(store._id, {
        week,
        year,
        shifts: currentShifts,
      });
      await loadScheduleData();
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể gán nhân viên vào ca.');
    }
  };

  // Handle Remove Employee from Shift
  const handleRemoveEmployee = async (shiftItem, empId) => {
    if (!store?._id || !schedule?.shifts) return;

    const currentShifts = [...schedule.shifts];
    const shiftIdx = currentShifts.findIndex(
      (s) =>
        s.date === shiftItem.date &&
        (s.shiftId === shiftItem.shiftId || s.shiftName === shiftItem.shiftName)
    );

    if (shiftIdx >= 0) {
      currentShifts[shiftIdx].assignments = currentShifts[shiftIdx].assignments.filter(
        (a) => (a.userId?._id || a.userId || a.id) !== empId
      );

      try {
        await scheduleApi.saveDraft(store._id, {
          week,
          year,
          shifts: currentShifts,
        });
        await loadScheduleData();
      } catch (err) {
        Alert.alert('Lỗi', err.message || 'Không thể xóa nhân viên khỏi ca.');
      }
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

        {/* 2. 7-Day Strip */}
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

        {/* 3. Shifts List */}
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
                onAssignEmployee={(s) => {
                  setSelectedShiftForAssign(s);
                  setAssignModalVisible(true);
                }}
                onRemoveEmployee={handleRemoveEmployee}
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
