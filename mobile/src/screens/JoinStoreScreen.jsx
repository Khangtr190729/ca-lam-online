import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { storeApi } from '../services/api';
import colors from '../theme/colors';
import CustomButton from '../components/CustomButton';

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
      if (res && res.success) {
        setSuccessMsg(res.message || 'Gia nhập cửa hàng thành công!');
        // Refresh store state
        await fetchMyStore();
      } else {
        setError(res?.message || 'Mã mời không hợp lệ hoặc đã hết hạn.');
      }
    } catch (err) {
      setError(err.message || 'Không thể gia nhập cửa hàng. Vui lòng kiểm tra lại mã.');
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
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
        <View style={styles.card}>
          <View style={styles.methodHeader}>
            <View style={styles.badgeNumber}>
              <Text style={styles.badgeNumberText}>1</Text>
            </View>
            <Text style={styles.methodTitle}>Nhập mã mời 6 chữ số</Text>
          </View>
          <Text style={styles.methodDesc}>
            Mã ngẫu nhiên do Chủ quán cấp, có hiệu lực trong vòng 60 phút.
          </Text>

          <View style={styles.codeContainer}>
            {digits.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(v) => handleDigitChange(idx, v)}
                onKeyPress={(e) => handleDigitKeyPress(idx, e)}
              />
            ))}
          </View>

          <CustomButton
            title="Gia nhập cửa hàng"
            onPress={handleJoin}
            loading={loading}
            disabled={digits.join('').length !== 6}
            style={styles.joinBtn}
          />
        </View>

        {/* Method 2: Share Email */}
        <View style={styles.card}>
          <View style={styles.methodHeader}>
            <View style={[styles.badgeNumber, styles.badgeNumberAlt]}>
              <Text style={styles.badgeNumberTextAlt}>2</Text>
            </View>
            <Text style={styles.methodTitle}>Gửi Email tài khoản cho Chủ quán</Text>
          </View>
          <Text style={styles.methodDesc}>
            Chủ quán có thể thêm trực tiếp tài khoản của bạn vào hệ thống bằng Email:
          </Text>

          <View style={styles.emailBox}>
            <Text style={styles.emailText}>{user?.email || 'email@calam.vn'}</Text>
            <TouchableOpacity
              onPress={handleCopyEmail}
              style={styles.copyBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copiedEmail ? 'checkmark-outline' : 'copy-outline'}
                size={16}
                color={copiedEmail ? colors.success : colors.primary}
              />
              <Text
                style={[
                  styles.copyBtnText,
                  copiedEmail && { color: colors.success },
                ]}
              >
                {copiedEmail ? 'Đã sao chép' : 'Sao chép'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.refreshStoreBtn}
            onPress={fetchMyStore}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.primary} />
            <Text style={styles.refreshStoreBtnText}>
              Đã được thêm? Bấm kiểm tra lại
            </Text>
          </TouchableOpacity>
        </View>

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
    backgroundColor: colors.background,
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
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badgeNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeNumberAlt: {
    backgroundColor: '#E2E8F0',
  },
  badgeNumberTextAlt: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  methodDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  codeBox: {
    width: 44,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  codeBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  joinBtn: {
    marginTop: 2,
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  emailText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  refreshStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  refreshStoreBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
});

export default JoinStoreScreen;
