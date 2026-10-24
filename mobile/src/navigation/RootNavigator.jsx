import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import JoinStoreScreen from '../screens/JoinStoreScreen';

export const RootNavigator = () => {
  const { user, store, isLoading } = useAuth();

  // Loading Splash
  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoBadge}>
          <Ionicons name="calendar" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.splashTitle}>Ca Làm Online</Text>
        <Text style={styles.splashSubtitle}>Xếp ca & Quản lý lương</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.spinner}
        />
      </View>
    );
  }

  // Not logged in -> Auth flow
  if (!user) {
    return <AuthNavigator />;
  }

  // Logged in but not joined any store yet -> Join store screen
  if (!store) {
    return <JoinStoreScreen />;
  }

  // Authenticated and has a store -> Main app tabs
  return <AppNavigator />;
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  spinner: {
    marginTop: 32,
  },
});

export default RootNavigator;
