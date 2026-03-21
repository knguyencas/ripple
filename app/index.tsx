import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { useAuthStore } from '../stores/auth.store';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(() => {
        if (token) {
          router.replace('/tabs/home');
        } else {
          router.replace('/auth/login');
        }
      }, 500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.wave1} />
      <View style={styles.wave2} />
      <View style={styles.wave3} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={styles.emoji}>🌊</Text>
        <Text style={styles.title}>Ripple</Text>
        <Text style={styles.subtitle}>Your emotional ocean</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.foam,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.mist,
    opacity: 0.4,
    top: -100,
    right: -100,
  },
  wave2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.wave,
    opacity: 0.15,
    bottom: -50,
    left: -80,
  },
  wave3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.teal,
    opacity: 0.1,
    bottom: 100,
    right: -40,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    fontSize: 42,
    color: Colors.teal,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodySecondary,
    fontSize: 16,
    letterSpacing: 0.5,
  },
});