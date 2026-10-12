import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMilkData } from '../context/MilkDataContext';
import { AppHeader } from '../components/AppHeader';
import { MonthCard } from '../components/MonthCard';
import { RateModal } from '../components/RateModal';
import {
  calculateMonthlyTotals,
  resolveMonthRate,
  MonthlySummary,
} from '../utils/calculations';
import { formatMonthKey, getTodayKey } from '../utils/dates';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { entries, rates, setMonthlyRate } = useMilkData();
  const currentMonthKey = useMemo(() => formatMonthKey(new Date()), []);
  const todayKey = useMemo(() => getTodayKey(), []);

  // Rate Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMonthKey, setEditingMonthKey] = useState('');
  const [editingCurrentRate, setEditingCurrentRate] = useState(0);

  const defaults = useMemo(
    () => ({
      morning: profile?.defaultMorning ?? 1.0,
      evening: profile?.defaultEvening ?? 0.5,
    }),
    [profile?.defaultMorning, profile?.defaultEvening]
  );

  // Compute list of past & current months
  const monthSummaries = useMemo<MonthlySummary[]>(() => {
    const monthKeysSet = new Set<string>();
    monthKeysSet.add(currentMonthKey);

    Object.keys(entries).forEach((dateKey) => {
      const monthPart = dateKey.slice(0, 7);
      monthKeysSet.add(monthPart);
    });

    Object.keys(rates).forEach((monthKey) => {
      monthKeysSet.add(monthKey);
    });

    const [curYearStr, curMonthStr] = currentMonthKey.split('-');
    const curYear = parseInt(curYearStr, 10);
    const curMonth = parseInt(curMonthStr, 10);

    for (let i = 1; i <= 2; i++) {
      let y = curYear;
      let m = curMonth - i;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      monthKeysSet.add(`${y}-${m.toString().padStart(2, '0')}`);
    }

    const sortedMonthKeys = Array.from(monthKeysSet).sort().reverse();
    const defaultRate = profile?.defaultRate ?? 56;

    return sortedMonthKeys.map((mKey) => {
      const rateInfo = resolveMonthRate(mKey, rates, defaultRate);
      return calculateMonthlyTotals(
        entries,
        mKey,
        rateInfo.rate,
        rateInfo.isInherited,
        rateInfo.sourceMonth,
        defaults,
        todayKey
      );
    });
  }, [entries, rates, currentMonthKey, profile, defaults, todayKey]);

  const handleEditRate = useCallback((monthKey: string, currentRate: number) => {
    setEditingMonthKey(monthKey);
    setEditingCurrentRate(currentRate);
    setModalVisible(true);
  }, []);

  const handleSaveRate = useCallback(
    async (monthKey: string, rate: number) => {
      await setMonthlyRate(monthKey, rate);
    },
    [setMonthlyRate]
  );

  const handleSelectMonth = useCallback(
    (monthKey: string) => {
      navigation.navigate('Tracker', { monthKey });
    },
    [navigation]
  );

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Consistent Top Header across all pages */}
        <AppHeader />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title matching user mockup */}
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Monthly summary
          </Text>

          {/* Monthly Gradient Cards matching mockup */}
          <View style={styles.cardsContainer}>
            {monthSummaries.map((item, idx) => (
              <MonthCard
                key={item.monthKey}
                index={idx}
                summary={item}
                entries={entries}
                onEditRate={handleEditRate}
                onSelectMonth={handleSelectMonth}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <RateModal
        visible={modalVisible}
        monthKey={editingMonthKey}
        currentRate={editingCurrentRate}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveRate}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: Spacing.lg,
    letterSpacing: -0.5,
  },
  cardsContainer: {
    marginBottom: Spacing.xl,
  },
});
