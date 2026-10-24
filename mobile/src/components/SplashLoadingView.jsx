import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

/**
 * SplashLoadingView - Màn hình khởi động và nạp dữ liệu ứng dụng
 * Hiển thị logo nhận diện chính thức, hiệu ứng thở êm ái và thanh trạng thái đồng bộ
 */
export const SplashLoadingView = ({
  statusText = 'Đang khởi tạo ứng dụng...',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in text & spinner
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulse animation loop on logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [fadeAnim, pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Background Decorative Circles */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <View style={styles.centerContent}>
        {/* Pulsing Logo Card */}
        <Animated.View
          style={[
            styles.logoCard,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Image
            source={require('../../assets/splash.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Typography */}
        <Animated.View style={[styles.typographyContainer, { opacity: fadeAnim }]}>
          <Text style={styles.appTitle}>Ca Làm Online</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>XẾP CA & QUẢN LÝ LƯƠNG</Text>
          </View>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusText}>{statusText}</Text>
        </Animated.View>
      </View>

      {/* Footer Version Tag */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Phiên bản 1.0.0 • Nền tảng di động</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  bgCircleTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(234, 112, 27, 0.08)',
  },
  bgCircleBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(43, 178, 172, 0.08)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 26,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  logoImage: {
    width: 105,
    height: 105,
  },
  typographyContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.8,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

export default SplashLoadingView;
