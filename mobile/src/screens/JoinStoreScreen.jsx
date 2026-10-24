import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { storeApi } from '../services/api';
import colors from '../theme/colors';

import JoinCodeSection from '../components/store/JoinCodeSection';
import ShareEmailSection from '../components/store/ShareEmailSection';

export const JoinStoreScreen = () => {
  const { user, fetchMyStore, logout } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const inputsRef = useRef([]);

  const handleDigitChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    const newDigits = [...digits];

    if (!val) {
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    if (val.length > 1) {
      const chars = val.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setDigits(newDigits);
      const nextIdx = Math.min(chars.length, 5);
      inputsRef.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = val;
    setDigits(newDigits);
    setError('');

    if (index < 5 && val) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyPress = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleJoin = async () => {
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã mời.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await storeApi.joinByCode(code);
      setSuccessMsg(res.message || 'Gia nhập cửa hàng thành công!');
      // Tải lại cửa hàng để RootNavigator tự động chuyển vào AppNavigator
      await fetchMyStore();
    } catch (err) {
      setError(err.message || 'Mã mời không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
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
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="storefront-outline" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Tham gia Cửa hàng</Text>
          <Text style={styles.subtitle}>
            Chào <Text style={styles.bold}>{user?.fullName || 'bạn'}</Text>! Bạn chưa gia nhập cửa hàng nào.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.successBannerText}>{successMsg}</Text>
          </View>
        ) : null}

        {/* Method 1: Enter 6-digit Code */}
        <JoinCodeSection
          digits={digits}
          inputsRef={inputsRef}
          onDigitChange={handleDigitChange}
          onDigitKeyPress={handleDigitKeyPress}
          onJoin={handleJoin}
          loading={loading}
        />

        {/* Method 2: Share Email */}
        <ShareEmailSection
          email={user?.email}
          copiedEmail={copiedEmail}
          onCopyEmail={handleCopyEmail}
          onRefreshStore={fetchMyStore}
        />

        {/* Logout Option */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Đăng xuất tài khoản khác</Text>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  successBannerText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '700',
  },
});

export default JoinStoreScreen;
