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

export const NotificationScreen = () => {
  const { store } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'SCHEDULE' | 'EVALUATION'

  // Notifications mock / data derived from store events
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

  const getIcon = (type) => {
    switch (type) {
      case 'SCHEDULE':
        return <Ionicons name="calendar" size={20} color={colors.primary} />;
      case 'EVALUATION':
        return <Ionicons name="ribbon" size={20} color="#10B981" />;
      case 'INVITE':
      default:
        return <Ionicons name="storefront" size={20} color="#3B82F6" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'SCHEDULE':
        return colors.primaryLight;
      case 'EVALUATION':
        return '#ECFDF5';
      case 'INVITE':
      default:
        return '#EFF6FF';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'SCHEDULE', label: 'Lịch làm' },
            { id: 'EVALUATION', label: 'Đánh giá' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterChip,
                filter === tab.id && styles.filterChipSelected,
              ]}
              onPress={() => setFilter(tab.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === tab.id && styles.filterChipTextSelected,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
            <Text style={styles.emptySubtitle}>
              Khi có lịch làm mới hoặc thông tin từ cửa hàng, bạn sẽ nhận được thông báo tại đây.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <View
              key={item.id}
              style={[
                styles.notificationCard,
                !item.read && styles.notificationCardUnread,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getIconBg(item.type) },
                ]}
              >
                {getIcon(item.type)}
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
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
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  notificationCard: {
    flexDirection: 'row',
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
  notificationCardUnread: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFCFA',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    marginLeft: 6,
  },
  notificationMessage: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});

export default NotificationScreen;
