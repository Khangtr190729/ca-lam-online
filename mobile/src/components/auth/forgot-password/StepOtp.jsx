import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../../theme/colors';
import CustomButton from '../../CustomButton';

export const StepOtp = ({
  otpDigits,
  otpInputsRef,
  resendCountdown,
  loading,
  onChangeDigit,
  onKeyPress,
  onChangeEmailPress,
  onResendOtp,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
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
            onChangeText={(v) => onChangeDigit(idx, v)}
            onKeyPress={(e) => onKeyPress(idx, e)}
          />
        ))}
      </View>

      <Text style={styles.otpExpiryNote}>
        Mã xác thực có hiệu lực trong vòng 10 phút.
      </Text>

      <View style={styles.resendRow}>
        <TouchableOpacity onPress={onChangeEmailPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.changeEmailText}>Đổi email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onResendOtp}
          disabled={resendCountdown > 0 || loading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
        onPress={onSubmit}
        loading={loading}
        disabled={otpDigits.join('').length !== 6}
        style={styles.submitBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  otpBox: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    backgroundColor: '#F8FAFC',
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  otpExpiryNote: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  changeEmailText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  resendText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  resendTextDisabled: {
    color: colors.textMuted,
  },
  submitBtn: {
    marginTop: 4,
  },
});

export default StepOtp;
