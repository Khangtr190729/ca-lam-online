import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import colors from '../theme/colors';
import { formatVND } from '../utils/formatters';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

export const ProfileScreen = () => {
  const { user, store, roleInStore, hourlyWage, logout, refreshUserAndStore } = useAuth();

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [gender, setGender] = useState(user?.gender || 'Nam');
  const [age, setAge] = useState(String(user?.age || ''));
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  // Handle Profile Update
  const handleUpdateProfile = async () => {
    if (!fullName.trim() || !age) {
      setProfileMsg({ type: 'error', text: 'Vui lòng nhập Họ tên và Tuổi.' });
      return;
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 15 || parsedAge > 100) {
      setProfileMsg({ type: 'error', text: 'Độ tuổi hợp lệ từ 15 đến 100 tuổi.' });
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMsg(null);
      const res = await userApi.updateProfile({
        fullName: fullName.trim(),
        gender,
        age: parsedAge,
      });
      if (res && res.success) {
        setProfileMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        await refreshUserAndStore();
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Cập nhật thất bại.' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassMsg({ type: 'error', text: 'Vui lòng điền đầy đủ các trường mật khẩu.' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    try {
      setChangingPass(true);
      setPassMsg(null);
      const res = await userApi.changePassword({
        oldPassword,
        newPassword,
      });
      if (res && res.success) {
        setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message || 'Đổi mật khẩu thất bại.' });
    } finally {
      setChangingPass(false);
    }
  };

  // Confirm logout
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
      return;
    }
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Card Banner */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.fullName || 'Nhân viên'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {roleInStore === 'MANAGER' ? 'Quản lý cửa hàng' : 'Người đi làm (Nhân viên)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Store Membership Info */}
        {store ? (
          <View style={styles.storeCard}>
            <View style={styles.storeCardHeader}>
              <Ionicons name="storefront" size={16} color={colors.primary} />
              <Text style={styles.storeCardTitle}>Cửa hàng đang làm việc</Text>
            </View>
            <Text style={styles.storeCardName}>{store.name}</Text>
            {store.address ? (
              <Text style={styles.storeCardAddress}>{store.address}</Text>
            ) : null}

            <View style={styles.wageRow}>
              <Text style={styles.wageLabel}>Mức lương được gắn:</Text>
              <Text style={styles.wageValue}>{formatVND(hourlyWage)}/h</Text>
            </View>
          </View>
        ) : null}

        {/* SECTION 1: Cập nhật thông tin cá nhân */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <Text style={styles.sectionDesc}>
            Cập nhật họ tên, giới tính và độ tuổi của bạn
          </Text>

          {profileMsg ? (
            <View
              style={[
                styles.messageBanner,
                profileMsg.type === 'success'
                  ? styles.successBanner
                  : styles.errorBanner,
              ]}
            >
              <Ionicons
                name={
                  profileMsg.type === 'success'
                    ? 'checkmark-circle'
                    : 'alert-circle'
                }
                size={16}
                color={profileMsg.type === 'success' ? colors.success : colors.danger}
              />
              <Text
                style={[
                  styles.messageText,
                  profileMsg.type === 'success'
                    ? styles.successText
                    : styles.errorText,
                ]}
              >
                {profileMsg.text}
              </Text>
            </View>
          ) : null}

          <CustomInput
            label="Họ và tên"
            required
            value={fullName}
            onChangeText={setFullName}
            placeholder="Họ tên của bạn"
            leftIcon={
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            }
          />

          {/* Gender */}
          <View style={styles.genderContainer}>
            <Text style={styles.inputLabel}>Giới tính *</Text>
            <View style={styles.genderRow}>
              {['Nam', 'Nữ', 'Khác'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderChip,
                    gender === g && styles.genderChipSelected,
                  ]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.genderChipText,
                      gender === g && styles.genderChipTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <CustomInput
            label="Tuổi"
            required
            value={age}
            onChangeText={(t) => setAge(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="Số tuổi"
            leftIcon={
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            }
          />

          <CustomButton
            title="Lưu thông tin"
            onPress={handleUpdateProfile}
            loading={savingProfile}
            style={styles.saveBtn}
          />
        </View>

        {/* SECTION 2: Đổi mật khẩu */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
          <Text style={styles.sectionDesc}>
            Cập nhật mật khẩu mới để bảo vệ tài khoản
          </Text>

          {passMsg ? (
            <View
              style={[
                styles.messageBanner,
                passMsg.type === 'success'
                  ? styles.successBanner
                  : styles.errorBanner,
              ]}
            >
              <Ionicons
                name={
                  passMsg.type === 'success'
                    ? 'checkmark-circle'
                    : 'alert-circle'
                }
                size={16}
                color={passMsg.type === 'success' ? colors.success : colors.danger}
              />
              <Text
                style={[
                  styles.messageText,
                  passMsg.type === 'success'
                    ? styles.successText
                    : styles.errorText,
                ]}
              >
                {passMsg.text}
              </Text>
            </View>
          ) : null}

          <CustomInput
            label="Mật khẩu hiện tại"
            required
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            placeholder="••••••••"
            leftIcon={
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
            }
          />

          <CustomInput
            label="Mật khẩu mới"
            required
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Tối thiểu 6 ký tự"
            leftIcon={
              <Ionicons name="key-outline" size={18} color={colors.textSecondary} />
            }
          />

          <CustomInput
            label="Xác nhận mật khẩu mới"
            required
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Nhập lại mật khẩu mới"
            leftIcon={
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
            }
          />

          <CustomButton
            title="Cập nhật mật khẩu"
            onPress={handleChangePassword}
            loading={changingPass}
            variant="secondary"
            style={styles.saveBtn}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Đăng xuất khỏi ứng dụng</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  storeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  storeCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  storeCardName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  storeCardAddress: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  wageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  wageLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  wageValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sectionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  successBanner: {
    backgroundColor: colors.successLight,
    borderColor: '#A7F3D0',
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderColor: '#FECACA',
  },
  messageText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  successText: {
    color: '#065F46',
  },
  errorText: {
    color: colors.danger,
  },
  genderContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  genderChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  genderChipTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: 4,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
});

export default ProfileScreen;
