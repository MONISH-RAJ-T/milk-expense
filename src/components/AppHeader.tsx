import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Spacing } from '../theme/colors';

interface AppHeaderProps {
  title?: string;
  showThemeToggle?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'MilkLedger',
  showThemeToggle = true,
}) => {
  const { isDark, colors, toggleTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

      <View style={styles.rightActions}>
        {showThemeToggle && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.themeToggleBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
              pressed && styles.btnPressed,
            ]}
            hitSlop={8}
          >
            <Feather
              name={isDark ? 'sun' : 'moon'}
              size={18}
              color={isDark ? '#FDE047' : '#475569'}
            />
          </Pressable>
        )}

        <View
          style={[
            styles.avatarWrapper,
            {
              borderColor: colors.avatarBorder,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Image
            source={require('../../assets/cow_mascot.jpg')}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
