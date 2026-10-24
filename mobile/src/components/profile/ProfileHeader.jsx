import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export const ProfileHeader = ({ user }) => {
  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'N';

  return (
    <View style={styles.header}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.userName}>{user?.fullName || 'Nhân viên'}</Text>
      <Text style={styles.userEmail}>{user?.email || 'email@calam.vn'}</Text>
      <View style={styles.roleTag}>
        <Text style={styles.roleTagText}>NGƯỜI ĐI LÀM</Text>
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
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
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
