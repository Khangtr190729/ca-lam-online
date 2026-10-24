import React, { useState, useEffect, useCallback } from 'react';
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
import { memberApi, storeApi } from '../../services/api';
import colors from '../../theme/colors';

import InviteCodeBanner from '../../components/admin/member/InviteCodeBanner';
import MemberCardItem from '../../components/admin/member/MemberCardItem';
import EditMemberWageModal from '../../components/admin/member/EditMemberWageModal';

export const AdminMemberScreen = () => {
  const { store } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const getSafeCode = (rawCode) => {
    if (!rawCode) return '';
    if (typeof rawCode === 'object') return rawCode.code || '';
    return String(rawCode);
  };

  const [inviteCode, setInviteCode] = useState(() => getSafeCode(store?.inviteCode));
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [savingWage, setSavingWage] = useState(false);

  const loadMembers = useCallback(async (isRefresh = false) => {
    if (!store?._id) return;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await memberApi.getMembers(store._id);
      if (res?.success) {
        setMembers(res.members || []);
      }
    } catch (err) {
      console.warn('Error loading members:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [store?._id]);

  useEffect(() => {
    loadMembers();
    if (store?.inviteCode) {
      setInviteCode(getSafeCode(store.inviteCode));
    }
  }, [loadMembers, store?.inviteCode]);

  // Generate Invite Code
  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);
      const res = await storeApi.generateInviteCode();
      if (res?.success && res.inviteCode) {
        const safeCode = getSafeCode(res.inviteCode);
        setInviteCode(safeCode);
        Alert.alert('Thành công', `Mã mời mới của bạn là: ${safeCode} (hiệu lực 60 phút).`);
      }
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo mã mời.');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = (codeToCopy) => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Open Edit Wage Modal
  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setEditModalVisible(true);
  };

  // Save Wage & Role
  const handleSaveWageAndRole = async (member, wage, employmentType) => {
    if (!store?._id || !member) return;
    const memberId = member._id || member.userId?._id;

    try {
      setSavingWage(true);
      await Promise.all([
        memberApi.updateWage(store._id, memberId, wage),
        memberApi.updateEmploymentType(store._id, memberId, employmentType),
      ]);
      setEditModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật lương và chế độ nhân viên!');
      await loadMembers();
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Cập nhật thất bại.');
    } finally {
      setSavingWage(false);
    }
  };

  // Delete Member
  const handleDeleteMember = (member) => {
    const memberId = member._id || member.userId?._id;
    const name = member.userId?.fullName || 'nhân viên này';

    Alert.alert(
      'Xóa nhân viên',
      `Bạn có chắc chắn muốn xóa ${name} khỏi danh sách nhân viên của cửa hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa nhân viên',
          style: 'destructive',
          onPress: async () => {
            try {
              await memberApi.removeMember(store._id, memberId);
              Alert.alert('Thành công', `Đã xóa ${name} khỏi cửa hàng.`);
              await loadMembers();
            } catch (err) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa nhân viên.');
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
            onRefresh={() => loadMembers(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Danh sách Nhân viên</Text>
          <Text style={styles.subtitle}>
            Tổng cộng {members.length} nhân viên • Quản lý lương theo giờ và chế độ trực
          </Text>
        </View>

        {/* 1. Invite Code Banner */}
        <InviteCodeBanner
          inviteCode={inviteCode}
          copied={copiedCode}
          onGenerateCode={handleGenerateCode}
          onCopyCode={handleCopyCode}
          generating={generatingCode}
        />

        {/* 2. Members List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            NHÂN VIÊN CỬA HÀNG ({members.length})
          </Text>

          {loading && !refreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Đang tải danh sách nhân viên...</Text>
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có nhân viên nào</Text>
              <Text style={styles.emptyDesc}>
                Tạo mã mời 6 chữ số ở trên và gửi cho nhân viên để họ gia nhập cửa hàng!
              </Text>
            </View>
          ) : (
            members.map((member) => (
              <MemberCardItem
                key={member._id || member.userId?._id}
                member={member}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteMember}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Wage Modal */}
      <EditMemberWageModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        member={selectedMember}
        onSave={handleSaveWageAndRole}
        saving={savingWage}
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
  listSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
});

export default AdminMemberScreen;
