import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import colors from '../theme/colors';

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  icon = null,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#CBD5E1';
    switch (variant) {
      case 'secondary':
        return colors.primaryLight;
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.danger;
      case 'primary':
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#94A3B8';
    switch (variant) {
      case 'secondary':
        return colors.primary;
      case 'outline':
        return colors.primary;
      case 'danger':
        return '#FFFFFF';
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      case 'md':
      default:
        return { paddingVertical: 13, paddingHorizontal: 18 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 16;
      case 'md':
      default:
        return 14;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variant === 'primary' && !disabled && styles.primaryShadow,
        getPadding(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'outline' ? colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default CustomButton;
