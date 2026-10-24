import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { memberApi, shiftApi, scheduleApi } from '../../services/api';
import colors from '../../theme/colors';
import { getMondayOfWeek, getWeekNumberAndYear } from '../../utils/formatters';

import StatOverviewCards from '../../components/admin/dashboard/StatOverviewCards';
import QuickActionsGrid from '../../components/admin/dashboard/QuickActionsGrid';
import TodayShiftsSection from '../../components/admin/dashboard/TodayShiftsSection';

export const AdminDashboardScreen = ({ navigation }) => {
  const { user, store } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [shiftsCount, setShiftsCount] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({
    shiftCount: 0,
    totalHours: 0,
    totalWageCost: 0,
    isPublished: false,
  });
  const [todayShifts, setTodayShifts] = useState([]);
  const [publishing, setPublishing] = useState(false);

  const { week, year } = getWeekNumberAndYear(new Date());

  const loadDashboardData = useCallback(async () => {
    if (!store?._id) return;
    try {
      const [membersRes, shiftsRes, scheduleRes] = await Promise.all([
        memberApi.getMembers(store._id).catch(() => null),
        shiftApi.getShifts(store._id).catch(() => null),
        scheduleApi.getWeeklySchedule(store._id, week, year).catch(() => null),
      ]);

      if (membersRes?.success) {
        setMemberCount(membersRes.members?.length || 0);
      }
      if (shiftsRes?.success) {
        setShiftsCount(shiftsRes.shifts?.length || 0);
      }
      if (scheduleRes?.success && scheduleRes.schedule) {
        const sched = scheduleRes.schedule;
        const totalHours = sched.totalHours || 0;
        const totalCost = sched.totalEstimatedCost || 0;
        const count = sched.shifts?.length || 0;
        const isPub = sched.status === 'PUBLISHED';

        setWeeklyStats({
          shiftCount: count,
          totalHours,
          totalWageCost: totalCost,
          isPublished: isPub,
        });

        // Filter shifts for today
        const todayStr = new Date().toISOString().split('T')[0];
        const forToday = (sched.shifts || []).filter((s) => s.date === todayStr);
        setTodayShifts(forToday);
      }
    } catch (e) {
      console.warn('Dashboard data load error:', e.message);
    }
  }, [store?._id, week, year]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handlePublish = async () => {
    if (!store?._id) return;
    Alert.alert(
      'Xuất bản lịch làm việc',
      `Bạn có chắc chắn muốn xuất bản lịch làm việc Tuần ${week}/${year} và gửi email thông báo tới toàn bộ nhân viên?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xuất bản & Gửi Email',
          onPress: async () => {
            try {
              setPublishing(true);
              const res = await scheduleApi.publishSchedule(store._id, { week, year });
              Alert.alert('Thành công', res.message || 'Lịch làm việc đã được xuất bản thành công!');
              await loadDashboardData();
            } catch (err) {
              Alert.alert('Lỗi', err.message || 'Không thể xuất bản lịch làm.');
            } finally {
              setPublishing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Store & Owner info */}
        <View style={styles.topHeader}>
          <View style={styles.storeBadge}>
            <Ionicons name="storefront" size={14} color={colors.primary} />
            <Text style={styles.storeName}>{store?.name || 'Cửa hàng của tôi'}</Text>
          </View>
          <Text style={styles.greetingTitle}>
            Xin chào Chủ quán {user?.fullName || ''}! 👑
          </Text>
          <Text style={styles.weekTag}>
            Quản trị cửa hàng • Tuần {week}/{year}
          </Text>
        </View>

        {/* 1. Stat Overview */}
        <StatOverviewCards
          memberCount={memberCount}
          shiftCount={weeklyStats.shiftCount}
          totalHours={weeklyStats.totalHours}
          totalWageCost={weeklyStats.totalWageCost}
          isPublished={weeklyStats.isPublished}
        />

        {/* 2. Quick Actions */}
        <QuickActionsGrid
          onGoToSchedule={() => navigation.navigate('AdminSchedule')}
          onGoToMembers={() => navigation.navigate('AdminMembers')}
          onGoToShifts={() => navigation.navigate('AdminShifts')}
          onPublishSchedule={handlePublish}
          publishing={publishing}
        />

        {/* 3. Today Shifts Section */}
        <TodayShiftsSection
          todayShifts={todayShifts}
          onGoToSchedule={() => navigation.navigate('AdminSchedule')}
        />
      </ScrollView>
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
  topHeader: {
    marginBottom: 18,
    marginTop: 4,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  weekTag: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;
