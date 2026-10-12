import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMilkData } from '../context/MilkDataContext';
import { AppHeader } from '../components/AppHeader';
import { Calendar } from '../components/Calendar';
import { QuantityStepper } from '../components/QuantityStepper';
import {
  getTodayKey,
  formatDisplayDateFull,
  formatMonthKey,
  getMonthName,
} from '../utils/dates';
import {
  calculateMonthlyTotals,
  resolveMonthRate,
  formatCurrency,
  formatLitres,
} from '../utils/calculations';

export const HomeScreen: React.FC<any> = ({ route }) => {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { entries, rates, setDailyEntry } = useMilkData();

  const todayKey = useMemo(() => getTodayKey(), []);

  // Calendar state
  const todayDate = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(todayDate.getMonth());

  // Listen to monthKey from navigation params (when tapped from Dashboard)
  useEffect(() => {
    if (route?.params?.monthKey) {
      const [yStr, mStr] = route.params.monthKey.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        setCurrentYear(y);
        setCurrentMonthIndex(m);
      }
    }
  }, [route?.params?.monthKey]);

  // Selected date on calendar: null when dismissed / not selected
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Stepper values for the selected date
  const [selectedMorning, setSelectedMorning] = useState(1.0);
  const [selectedEvening, setSelectedEvening] = useState(0.5);
  const [savingSelected, setSavingSelected] = useState(false);

  // Auto-show today's card only if today has NOT been bought yet!
  useEffect(() => {
    if (!hasUserInteracted) {
      if (entries[todayKey]) {
        setSelectedDateKey(null);
      } else {
        setSelectedDateKey(todayKey);
      }
    }
  }, [entries, todayKey, hasUserInteracted]);

  // Sync steppers whenever selectedDateKey, entries, or profile defaults change
  useEffect(() => {
    if (!selectedDateKey) return;
    const entry = entries[selectedDateKey];
    if (entry) {
      setSelectedMorning(entry.morning);
      setSelectedEvening(entry.evening);
    } else {
      setSelectedMorning(profile?.defaultMorning ?? 1.0);
      setSelectedEvening(profile?.defaultEvening ?? 0.5);
    }
  }, [selectedDateKey, entries, profile]);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleSelectDate = (dateKey: string) => {
    setHasUserInteracted(true);
    // Tapping the same date toggles it closed, otherwise opens it
    if (selectedDateKey === dateKey) {
      setSelectedDateKey(null);
    } else {
      setSelectedDateKey(dateKey);
    }
  };

  const savedEntry = selectedDateKey ? entries[selectedDateKey] : null;
  const isChanged = !savedEntry
    ? true
    : selectedMorning !== savedEntry.morning || selectedEvening !== savedEntry.evening;
  const isSaveDisabled = !isChanged || savingSelected;

  const handleSaveSelectedEntry = async () => {
    if (!selectedDateKey || isSaveDisabled) return;
    setSavingSelected(true);
    try {
      await setDailyEntry(selectedDateKey, selectedMorning, selectedEvening);
      // Keep the card visible; the button will now be disabled since values match saved
      setHasUserInteracted(true);
    } catch (err) {
      console.error('Failed to save entry', err);
    } finally {
      setSavingSelected(false);
    }
  };

  // Bottom summary calculations for the currently viewed month
  const viewedMonthKey = `${currentYear}-${(currentMonthIndex + 1).toString().padStart(2, '0')}`;
  const rateInfo = resolveMonthRate(viewedMonthKey, rates, profile?.defaultRate ?? 56);
  const defaults = useMemo(
    () => ({
      morning: profile?.defaultMorning ?? 1.0,
      evening: profile?.defaultEvening ?? 0.5,
    }),
    [profile?.defaultMorning, profile?.defaultEvening]
  );
  const monthlySummary = calculateMonthlyTotals(
    entries,
    viewedMonthKey,
    rateInfo.rate,
    rateInfo.isInherited,
    rateInfo.sourceMonth,
    defaults,
    todayKey
  );

  const monthName = getMonthName(currentMonthIndex);

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
          {/* Calendar Card */}
          <Calendar
            year={currentYear}
            monthIndex={currentMonthIndex}
            selectedDateKey={selectedDateKey || ''}
            entries={entries}
            onSelectDate={handleSelectDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Selected Date Entry Card - only visible when a date is selected */}
          {selectedDateKey ? (
            <View
              style={[
                styles.entryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <View style={styles.entryCardHeader}>
                <Text style={[styles.entryCardTitle, { color: colors.textPrimary }]}>
                  {formatDisplayDateFull(selectedDateKey)}
                </Text>
                <Pressable
                  onPress={() => setSelectedDateKey(null)}
                  style={({ pressed }) => [
                    styles.closeBtn,
                    { backgroundColor: colors.navBtnBg },
                    pressed && styles.btnPressed,
                  ]}
                  hitSlop={8}
                  accessibilityLabel="Close entry editor"
                >
                  <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.stepperContainer}>
                <QuantityStepper
                  label="Morning"
                  value={selectedMorning}
                  onChange={setSelectedMorning}
                />
                <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />
                <QuantityStepper
                  label="Evening"
                  value={selectedEvening}
                  onChange={setSelectedEvening}
                />
              </View>

              {/* Gradient Save Entry Button */}
              <Pressable
                onPress={handleSaveSelectedEntry}
                disabled={isSaveDisabled}
                style={({ pressed }) => [
                  styles.saveBtnWrapper,
                  pressed && !isSaveDisabled && styles.btnPressed,
                ]}
                hitSlop={8}
              >
                <LinearGradient
                  colors={
                    isSaveDisabled
                      ? ['#94A3B8', '#CBD5E1']
                      : colors.buttonGradient
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.confirmBtn, isSaveDisabled && styles.btnDisabled]}
                >
                  {savingSelected ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.confirmBtnText}>
                      {!isChanged && savedEntry ? 'Saved ✓' : 'Save entry ⭐'}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}

          {/* Month Summary Bar at the bottom */}
          <View style={styles.summaryBar}>
            <Text style={[styles.summaryMonthText, { color: colors.textSecondary }]}>
              {monthName} so far
            </Text>
            <Text style={[styles.summaryValueText, { color: colors.textPrimary }]}>
              {formatLitres(monthlySummary.totalLitres)} • {formatCurrency(monthlySummary.totalCost)}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2744',
    letterSpacing: -0.5,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  entryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  entryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  entryCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  stepperContainer: {
    gap: 4,
    marginBottom: Spacing.lg,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  saveBtnWrapper: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#2F6FED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPressed: {
    opacity: 0.88,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  summaryMonthText: {
    fontSize: 14,
    color: '#334E68',
    fontWeight: '600',
  },
  summaryValueText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2744',
  },
});
