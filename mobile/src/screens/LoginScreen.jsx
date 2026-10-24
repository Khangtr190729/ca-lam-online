import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="calendar" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.appTitle}>Ca Làm Online</Text>
          <Text style={styles.appSubtitle}>
            Ứng dụng theo dõi ca & bảng lương cho nhân viên
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đăng nhập</Text>
          <Text style={styles.cardDesc}>
            Nhập email và mật khẩu tài khoản người đi làm
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Địa chỉ Email"
            required
            placeholder="an.nguyen@calam.vn"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            }
          />

          <CustomInput
            label="Mật khẩu"
            required
            placeholder="••••••••"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError('');
            }}
            secureTextEntry
            leftIcon={
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
            }
          />

          {/* Quên mật khẩu link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword', { initialEmail: email })}
            style={styles.forgotPasswordButton}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Đăng nhập ngay"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          {/* Switch to Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Chưa có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Accounts Quick Fill Helper */}
        <View style={styles.quickFillCard}>
          <View style={styles.quickFillHeader}>
            <Ionicons name="flash-outline" size={14} color={colors.primary} />
            <Text style={styles.quickFillTitle}>Tài khoản nhân viên thử nghiệm:</Text>
          </View>

          <View style={styles.quickFillButtons}>
            <TouchableOpacity
              style={styles.chipButton}
              onPress={() => handleQuickFill('an.nguyen@calam.vn', 'password123')}
            >
              <Text style={styles.chipText}>An (Part-time)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chipButton}
              onPress={() => handleQuickFill('mai.tran@calam.vn', 'password123')}
            >
              <Text style={styles.chipText}>Mai (Part-time)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chipButton}
              onPress={() => handleQuickFill('phuc.le@calam.vn', 'password123')}
            >
              <Text style={styles.chipText}>Phúc (Full-time)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 20 : 10,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  loginButton: {
    marginTop: 4,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  registerPrompt: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  quickFillCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  quickFillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  quickFillTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  quickFillButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chipButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});

export default LoginScreen;
