import React, { useState, useEffect, useRef } from 'react';
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
import { authApi } from '../services/api';
import colors from '../theme/colors';

import StepEmail from '../components/auth/forgot-password/StepEmail';
import StepOtp from '../components/auth/forgot-password/StepOtp';
import StepNewPassword from '../components/auth/forgot-password/StepNewPassword';
import StepSuccess from '../components/auth/forgot-password/StepSuccess';

export const ForgotPasswordScreen = ({ route, navigation }) => {
  const initialEmail = route?.params?.initialEmail || '';
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const otpInputsRef = useRef([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfoMsg('');
      const res = await authApi.forgotPassword(cleanEmail);
      setInfoMsg(res.message || 'Mã xác thực OTP 6 số đã được gửi đến email của bạn.');
      setStep(2);
      setResendCountdown(60);
    } catch (err) {
      setError(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    try {
      setLoading(true);
      setError('');
      await authApi.forgotPassword(email.trim().toLowerCase());
      setInfoMsg('Đã gửi lại mã OTP mới vào hộp thư email của bạn!');
      setResendCountdown(60);
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Digits Handling
  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (!val) {
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    if (val.length > 1) {
      const chars = val.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(chars.length, 5);
      otpInputsRef.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = val;
    setOtpDigits(newDigits);
    setError('');

    if (index < 5 && val) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 số OTP.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authApi.verifyResetOtp(email.trim().toLowerCase(), otpCode);
      setStep(3);
      setInfoMsg('Xác thực OTP thành công! Vui lòng đặt mật khẩu mới.');
    } catch (err) {
      setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    const otpCode = otpDigits.join('');
    try {
      setLoading(true);
      setError('');
      await authApi.resetPassword(email.trim().toLowerCase(), otpCode, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>

        {/* Header Icon */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={
                step === 4
                  ? 'checkmark-circle'
                  : step === 3
                  ? 'shield-checkmark'
                  : step === 2
                  ? 'key'
                  : 'mail'
              }
              size={32}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>
            {step === 1 && 'Quên mật khẩu?'}
            {step === 2 && 'Xác thực mã OTP'}
            {step === 3 && 'Tạo mật khẩu mới'}
            {step === 4 && 'Đổi mật khẩu thành công!'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 && 'Nhập email tài khoản để nhận mã xác thực OTP 6 số'}
            {step === 2 && `Mã 6 chữ số đã được gửi đến email ${email}`}
            {step === 3 && 'Nhập mật khẩu mới an toàn tối thiểu 6 ký tự'}
            {step === 4 && 'Bạn có thể đăng nhập ngay bằng mật khẩu mới'}
          </Text>
        </View>

        <View style={styles.card}>
          {/* Step Indicator */}
          {step < 4 && (
            <View style={styles.stepper}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
                <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>
              </View>
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
                <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>
              </View>
              <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}>
                <Text style={[styles.stepNum, step >= 3 && styles.stepNumActive]}>3</Text>
              </View>
            </View>
          )}

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {infoMsg && step !== 4 ? (
            <View style={styles.infoBanner}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.infoBannerText}>{infoMsg}</Text>
            </View>
          ) : null}

          {/* Step 1: Input Email */}
          {step === 1 && (
            <StepEmail
              email={email}
              onChangeEmail={(t) => {
                setEmail(t);
                setError('');
              }}
              onSubmit={handleSendOtp}
              loading={loading}
            />
          )}

          {/* Step 2: 6-Digit OTP */}
          {step === 2 && (
            <StepOtp
              otpDigits={otpDigits}
              otpInputsRef={otpInputsRef}
              resendCountdown={resendCountdown}
              loading={loading}
              onChangeDigit={handleOtpChange}
              onKeyPress={handleOtpKeyPress}
              onChangeEmailPress={() => setStep(1)}
              onResendOtp={handleResendOtp}
              onSubmit={handleVerifyOtp}
            />
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <StepNewPassword
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              onChangeNewPassword={(t) => {
                setNewPassword(t);
                setError('');
              }}
              onChangeConfirmPassword={(t) => {
                setConfirmPassword(t);
                setError('');
              }}
              onSubmit={handleResetPassword}
              loading={loading}
            />
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <StepSuccess
              onGoToLogin={() => navigation.navigate('Login')}
            />
          )}
        </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    flex: 1,
  },
});

export default ForgotPasswordScreen;
