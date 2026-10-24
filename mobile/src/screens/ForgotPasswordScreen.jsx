import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../services/api';
import colors from '../theme/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

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
      setError('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authApi.verifyResetOtp(email.trim().toLowerCase(), otpCode);
      setInfoMsg('Mã OTP chính xác. Mời bạn đặt mật khẩu mới.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
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
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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

          {/* STEP 1: Email */}
          {step === 1 && (
            <View>
              <CustomInput
                label="Địa chỉ Email"
                required
                placeholder="an.nguyen@calam.vn"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                }
              />

              <CustomButton
                title="Gửi mã OTP qua Email"
                onPress={handleSendOtp}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <View>
              <Text style={styles.otpLabel}>Nhập mã xác thực 6 số (OTP)</Text>
              <View style={styles.otpContainer}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(idx, v)}
                    onKeyPress={(e) => handleOtpKeyPress(idx, e)}
                  />
                ))}
              </View>

              <Text style={styles.otpExpiryNote}>
                Mã xác thực có hiệu lực trong vòng 10 phút.
              </Text>

              <View style={styles.resendRow}>
                <TouchableOpacity onPress={() => setStep(1)}>
                  <Text style={styles.changeEmailText}>Đổi email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendCountdown > 0 || loading}
                >
                  <Text
                    style={[
                      styles.resendText,
                      resendCountdown > 0 && styles.resendTextDisabled,
                    ]}
                  >
                    {resendCountdown > 0
                      ? `Gửi lại sau ${resendCountdown}s`
                      : 'Gửi lại mã OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              <CustomButton
                title="Xác thực mã OTP"
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={otpDigits.join('').length !== 6}
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* STEP 3: New Password */}
          {step === 3 && (
            <View>
              <CustomInput
                label="Mật khẩu mới"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setError('');
                }}
                secureTextEntry
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                }
              />

              <CustomInput
                label="Xác nhận mật khẩu mới"
                required
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setError('');
                }}
                secureTextEntry
                leftIcon={
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
                }
              />

              <CustomButton
                title="Lưu mật khẩu mới"
                onPress={handleResetPassword}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* STEP 4: Success Done */}
          {step === 4 && (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-done-circle" size={48} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Mật khẩu đã được cập nhật!</Text>
              <Text style={styles.successDesc}>
                Bạn có thể đăng nhập ngay bằng mật khẩu mới để tiếp tục sử dụng hệ thống.
              </Text>
              <CustomButton
                title="Quay lại Đăng nhập"
                onPress={() => navigation.navigate('Login')}
                style={styles.submitBtn}
              />
            </View>
          )}
        </View>
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
    borderColor: '#F1F5F9',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
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
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 11,
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
    marginBottom: 14,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  otpBox: {
    width: 44,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  otpExpiryNote: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  changeEmailText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  resendText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  resendTextDisabled: {
    color: colors.textMuted,
  },
  submitBtn: {
    marginTop: 6,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successIconBox: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
});

export default ForgotPasswordScreen;
