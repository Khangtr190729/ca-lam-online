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
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

export const CreateStoreScreen = () => {
  const { user, createStore, logout } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên cửa hàng của bạn.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createStore({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
      });
      // RootNavigator will automatically transition to AdminAppNavigator
    } catch (err) {
      setError(err.message || 'Không thể tạo cửa hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="storefront" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Thiết lập Cửa hàng</Text>
          <Text style={styles.subtitle}>
            Chào Chủ quán <Text style={styles.bold}>{user?.fullName || ''}</Text>! Tạo cửa hàng đầu tiên của bạn để bắt đầu xếp ca và quản lý lương.
          </Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Tên cửa hàng / Thương hiệu"
            required
            placeholder="Ví dụ: Tiệm Trà Sữa Mùa Hè, Quán Trái Cây Tươi"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError('');
            }}
            leftIcon={
              <Ionicons name="storefront-outline" size={18} color={colors.primary} />
            }
          />

          <CustomInput
            label="Địa chỉ kinh doanh"
            placeholder="Ví dụ: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
            value={address}
            onChangeText={setAddress}
            leftIcon={
              <Ionicons name="location-outline" size={18} color={colors.primary} />
            }
          />

          <CustomInput
            label="Số điện thoại liên hệ"
            placeholder="Ví dụ: 0901234567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            }
          />

          <CustomButton
            title="Tạo cửa hàng và bắt đầu"
            onPress={handleCreate}
            loading={loading}
            style={styles.createBtn}
          />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
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
  createBtn: {
    marginTop: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '700',
  },
});

export default CreateStoreScreen;
