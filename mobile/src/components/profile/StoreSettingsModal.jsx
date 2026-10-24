import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';

/**
 * StoreSettingsModal - Cho phép Chủ cửa hàng chỉnh sửa Tên và Địa chỉ quán
 */
export const StoreSettingsModal = ({
  visible,
  onClose,
  store,
  onSave,
  saving = false,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setAddress(store.address || '');
    }
    setError('');
  }, [store, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên cửa hàng.');
      return;
    }
    onSave({
      name: name.trim(),
      address: address.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="storefront" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Cài đặt Cửa hàng</Text>
                <Text style={styles.subtitle}>Cập nhật tên và địa chỉ quán của bạn</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Tên cửa hàng"
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
              label="Địa chỉ quán"
              placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP.HCM"
              value={address}
              onChangeText={setAddress}
              leftIcon={
                <Ionicons name="location-outline" size={18} color={colors.primary} />
              }
            />

            {/* Actions */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>

              <View style={styles.saveBtnWrap}>
                <CustomButton
                  title={saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  onPress={handleSave}
                  loading={saving}
                  size="small"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveBtnWrap: {
    minWidth: 120,
  },
});

export default StoreSettingsModal;
