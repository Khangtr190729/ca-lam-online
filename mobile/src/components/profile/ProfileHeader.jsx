import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { getRoleLabel } from '../../utils/formatters';

export const ProfileHeader = ({ user, roleInStore, isAdmin = false }) => {
  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'N';
  const effectiveRole = isAdmin ? 'ADMIN' : (roleInStore || user?.systemRole || 'EMPLOYEE');
  const roleInfo = getRoleLabel(effectiveRole);

  const getRoleIcon = () => {
    if (effectiveRole === 'ADMIN') return 'storefront';
    if (effectiveRole === 'MANAGER') return 'shield-checkmark';
    return 'person';
  };

  return (
    <View style={styles.header}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
      <Text style={styles.userEmail}>{user?.email || 'email@calam.vn'}</Text>
      <View
        style={[
          styles.roleTag,
          {
            backgroundColor: roleInfo.bg,
            borderColor: roleInfo.border,
          },
        ]}
      >
        <Ionicons name={getRoleIcon()} size={12} color={roleInfo.color} />
        <Text style={[styles.roleTagText, { color: roleInfo.color }]}>
          {roleInfo.text.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
});

export default ProfileHeader;
