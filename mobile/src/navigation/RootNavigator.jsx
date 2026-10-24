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
          <Ionicons name="calendar" size={44} color={colors.primary} />
        </View>
        <Text style={styles.splashTitle}>Ca Làm Online</Text>
        <Text style={styles.splashSubtitle}>Xếp ca & Quản lý lương</Text>
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
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
    backgroundColor: '#EA701B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    fontWeight: '500',
  },
  spinner: {
    marginTop: 36,
  },
});

export default RootNavigator;
