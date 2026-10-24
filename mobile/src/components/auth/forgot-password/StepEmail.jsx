import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import CustomInput from '../../CustomInput';
import CustomButton from '../../CustomButton';

export const StepEmail = ({
  email,
  onChangeEmail,
  onSubmit,
  loading,
}) => {
  return (
    <View style={styles.container}>
      <CustomInput
        label="Địa chỉ Email"
        required
        placeholder="nhanvien@calam.vn"
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={
          <Ionicons name="mail-outline" size={18} color={colors.primary} />
        }
      />

      <CustomButton
        title="Gửi mã OTP qua Email"
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

export default StepEmail;
