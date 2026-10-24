import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export const CustomInput = forwardRef(({
  label,
  required = false,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon = null,
  error = null,
  helperText = null,
  containerStyle,
  inputStyle,
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  returnKeyType = 'next',
  onSubmitEditing,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const internalInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      internalInputRef.current?.focus();
    },
    blur: () => {
      internalInputRef.current?.blur();
    },
    clear: () => {
      internalInputRef.current?.clear();
    },
    isFocused: () => internalInputRef.current?.isFocused(),
  }));

  const handlePressWrapper = () => {
    if (editable) {
      internalInputRef.current?.focus();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Pressable onPress={handlePressWrapper} disabled={!editable}>
          <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={handlePressWrapper}
        disabled={!editable}
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        {leftIcon && (
          <View pointerEvents="none" style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          ref={internalInputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          underlineColorAndroid="transparent"
          style={[styles.input, inputStyle]}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Pressable>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  required: {
    color: colors.danger,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  inputWrapperDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  leftIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    paddingVertical: 0,
    paddingHorizontal: 2,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 2,
  },
  helperText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 2,
  },
});

export default CustomInput;
