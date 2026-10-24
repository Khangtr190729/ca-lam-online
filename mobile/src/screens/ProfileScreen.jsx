import React, { useState } from 'react';
import {
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import colors from '../theme/colors';

import ProfileHeader from '../components/profile/ProfileHeader';
import StoreInfoSection from '../components/profile/StoreInfoSection';
import EditProfileSection from '../components/profile/EditProfileSection';
import ChangePasswordSection from '../components/profile/ChangePasswordSection';

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Profile Header */}
        <ProfileHeader user={user} />

        {/* 2. Store Info Section */}
        <StoreInfoSection
          store={store}
          roleInStore={roleInStore}
          hourlyWage={hourlyWage}
        />

        {/* 3. Personal Info Form */}
        <EditProfileSection
          fullName={fullName}
          onChangeFullName={(t) => {
            setFullName(t);
            setProfileMsg(null);
          }}
          gender={gender}
          onChangeGender={(g) => {
            setGender(g);
            setProfileMsg(null);
          }}
          age={age}
          onChangeAge={(t) => {
            setAge(t);
            setProfileMsg(null);
          }}
          onSave={handleUpdateProfile}
          saving={savingProfile}
          feedbackMsg={profileMsg}
        />

        {/* 4. Change Password Form */}
        <ChangePasswordSection
          oldPassword={oldPassword}
          onChangeOldPassword={(t) => {
            setOldPassword(t);
            setPassMsg(null);
          }}
          newPassword={newPassword}
          onChangeNewPassword={(t) => {
            setNewPassword(t);
            setPassMsg(null);
          }}
          confirmPassword={confirmPassword}
          onChangeConfirmPassword={(t) => {
            setConfirmPassword(t);
            setPassMsg(null);
          }}
          onSave={handleChangePassword}
          saving={changingPass}
          feedbackMsg={passMsg}
        />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.danger,
  },
});

export default ProfileScreen;
