import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export const Badge = ({
  label,
  variant = 'default', // 'success' | 'warning' | 'danger' | 'primary' | 'neutral'
  size = 'md', // 'sm' | 'md'
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, text: '#065F46', border: '#A7F3D0' };
      case 'warning':
        return { bg: colors.warningLight, text: '#92400E', border: '#FDE68A' };
      case 'danger':
        return { bg: colors.dangerLight, text: '#991B1B', border: '#FECACA' };
      case 'primary':
        return { bg: colors.primaryLight, text: colors.primaryDark, border: '#FED7AA' };
      case 'neutral':
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  const currentColors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentColors.bg,
          borderColor: currentColors.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 6 : 8,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: currentColors.text,
            fontSize: size === 'sm' ? 10 : 11,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});

export default Badge;
