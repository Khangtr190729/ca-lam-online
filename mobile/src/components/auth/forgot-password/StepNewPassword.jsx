import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import CustomInput from '../../CustomInput';
import CustomButton from '../../CustomButton';

export const StepNewPassword = ({
  newPassword,
  confirmPassword,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onSubmit,
  loading,
}) => {
  return (
    <View style={styles.container}>
      <CustomInput
        label="Mật khẩu mới"
        required
        placeholder="Tối thiểu 6 ký tự"
        value={newPassword}
        onChangeText={onChangeNewPassword}
        secureTextEntry
        leftIcon={
          <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
        }
      />

      <CustomInput
        label="Xác nhận mật khẩu mới"
        required
        placeholder="Nhập lại mật khẩu mới"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        secureTextEntry
        leftIcon={
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
        }
      />

      <CustomButton
        title="Lưu mật khẩu mới"
        onPress={onSubmit}
        loading={loading}
        style={styles.submitBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default StepNewPassword;
