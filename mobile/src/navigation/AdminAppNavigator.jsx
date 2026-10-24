import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import colors from '../theme/colors';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminScheduleScreen from '../screens/admin/AdminScheduleScreen';
import AdminMemberScreen from '../screens/admin/AdminMemberScreen';
import AdminShiftScreen from '../screens/admin/AdminShiftScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const AdminAppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'AdminDashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'AdminSchedule':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'AdminMembers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'AdminShifts':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Profile':
            default:
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Tổng quan',
        }}
      />
      <Tab.Screen
        name="AdminSchedule"
        component={AdminScheduleScreen}
        options={{
          tabBarLabel: 'Xếp ca',
        }}
      />
      <Tab.Screen
        name="AdminMembers"
        component={AdminMemberScreen}
        options={{
          tabBarLabel: 'Nhân viên',
        }}
      />
      <Tab.Screen
        name="AdminShifts"
        component={AdminShiftScreen}
        options={{
          tabBarLabel: 'Ca làm',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminAppNavigator;
