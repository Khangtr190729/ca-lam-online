import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import CustomButton from '../CustomButton';

export const JoinCodeSection = ({
  digits,
  inputsRef,
  onDigitChange,
  onDigitKeyPress,
  onJoin,
  loading,
}) => {
  return (
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
            onChangeText={(v) => onDigitChange(idx, v)}
            onKeyPress={(e) => onDigitKeyPress(idx, e)}
          />
        ))}
      </View>

      <CustomButton
        title="Gia nhập cửa hàng"
        onPress={onJoin}
        loading={loading}
        disabled={digits.join('').length !== 6}
        style={styles.joinBtn}
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  methodDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 17,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  codeBox: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    backgroundColor: '#F8FAFC',
  },
  codeBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  joinBtn: {
    marginTop: 2,
  },
});

export default JoinCodeSection;
