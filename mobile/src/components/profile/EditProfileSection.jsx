import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';

export const EditProfileSection = ({
  fullName,
  onChangeFullName,
  gender,
  onChangeGender,
  age,
  onChangeAge,
  onSave,
  saving,
  feedbackMsg,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="person-outline" size={18} color={colors.primary} />
        <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
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
        label="Họ và tên"
        value={fullName}
        onChangeText={onChangeFullName}
        placeholder="Họ và tên"
        leftIcon={
          <Ionicons name="person-outline" size={18} color={colors.primary} />
        }
      />

      {/* Gender Picker */}
      <View style={styles.genderContainer}>
        <Text style={styles.genderLabel}>Giới tính</Text>
        <View style={styles.genderPills}>
          {['Nam', 'Nữ', 'Khác'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderPill,
                gender === g && styles.genderPillActive,
              ]}
              onPress={() => onChangeGender(g)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.genderPillText,
                  gender === g && styles.genderPillTextActive,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <CustomInput
        label="Tuổi"
        value={age}
        onChangeText={onChangeAge}
        placeholder="Ví dụ: 20"
        keyboardType="number-pad"
        leftIcon={
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        }
      />

      <CustomButton
        title="Lưu thông tin cá nhân"
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
    marginBottom: 16,
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
  genderContainer: {
    marginBottom: 14,
  },
  genderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  genderPills: {
    flexDirection: 'row',
    gap: 8,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  genderPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  genderPillTextActive: {
    color: colors.primaryDark,
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

export default EditProfileSection;
