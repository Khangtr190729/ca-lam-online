import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import NotificationItem from '../components/notification/NotificationItem';

export const NotificationScreen = () => {
  const { store } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'SCHEDULE' | 'EVALUATION'

  const [notifications] = useState([
    {
      id: '1',
      type: 'SCHEDULE',
      title: 'Lịch làm việc tuần mới đã được công bố',
      message: `Quản lý cửa hàng ${store?.name || 'shop trái cây'} đã xuất bản lịch làm việc và bảng lương dự kiến.`,
      time: 'Vừa xong',
      read: false,
    },
    {
      id: '2',
      type: 'INVITE',
      title: 'Chào mừng bạn gia nhập cửa hàng',
      message: `Bạn đã chính thức trở thành nhân viên của ${store?.name || 'shop trái cây'}. Hãy kiểm tra lịch làm hàng tuần nhé!`,
      time: '1 ngày trước',
      read: true,
    },
    {
      id: '3',
      type: 'EVALUATION',
      title: 'Hoàn thành tốt ca làm việc',
      message: 'Ca làm việc gần nhất của bạn đã được quản lý xác nhận hoàn thành đầy đủ.',
      time: '2 ngày trước',
      read: true,
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Thông báo</Text>
          <Text style={styles.subtitle}>
            Tin tức lịch trực, đánh giá ca làm và thông báo từ cửa hàng
          </Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'SCHEDULE', label: 'Lịch làm' },
            { key: 'EVALUATION', label: 'Đánh giá' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterPill,
                filter === item.key && styles.filterPillActive,
              ]}
              onPress={() => setFilter(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === item.key && styles.filterPillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
            <Text style={styles.emptySubtitle}>
              Các cập nhật mới nhất từ cửa hàng sẽ xuất hiện tại đây.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))
        )}
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationScreen;
