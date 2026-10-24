import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';

export const ChangePasswordSection = ({
  oldPassword,
  onChangeOldPassword,
  newPassword,
  onChangeNewPassword,
  confirmPassword,
  onChangeConfirmPassword,
  onSave,
  saving,
  feedbackMsg,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
        <Text style={styles.cardTitle}>Đổi mật khẩu</Text>
      </View>

      {feedbackMsg ? (
        <View
          style={[
            styles.banner,
            feedbackMsg.type === 'error'
              ? styles.bannerError
              : styles.bannerSuccess,
          ]}
        >
          <Ionicons
            name={
              feedbackMsg.type === 'error'
                ? 'alert-circle'
                : 'checkmark-circle'
            }
            size={16}
            color={
              feedbackMsg.type === 'error'
                ? colors.danger
                : colors.success
            }
          />
          <Text
            style={[
              styles.bannerText,
              feedbackMsg.type === 'error'
                ? styles.bannerTextError
                : styles.bannerTextSuccess,
            ]}
          >
            {feedbackMsg.text}
          </Text>
        </View>
      ) : null}

      <CustomInput
        label="Mật khẩu hiện tại"
        value={oldPassword}
        onChangeText={onChangeOldPassword}
        placeholder="Nhập mật khẩu hiện tại"
        secureTextEntry
        leftIcon={
          <Ionicons name="key-outline" size={18} color={colors.primary} />
        }
      />

      <CustomInput
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={onChangeNewPassword}
        placeholder="Tối thiểu 6 ký tự"
        secureTextEntry
        leftIcon={
          <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
        }
      />

      <CustomInput
        label="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        placeholder="Nhập lại mật khẩu mới"
        secureTextEntry
        leftIcon={
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
        }
      />

      <CustomButton
        title="Đổi mật khẩu"
        onPress={onSave}
        loading={saving}
        style={styles.saveBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  saveBtn: {
    marginTop: 6,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  bannerError: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bannerSuccess: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  bannerTextError: {
    color: colors.danger,
  },
  bannerTextSuccess: {
    color: colors.success,
  },
});

export default ChangePasswordSection;
