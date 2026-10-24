import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import CustomButton from '../../CustomButton';

export const StepSuccess = ({ onGoToLogin }) => {
  return (
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
        onPress={onGoToLogin}
        style={styles.submitBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  successIconBox: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  submitBtn: {
    width: '100%',
  },
});

export default StepSuccess;
