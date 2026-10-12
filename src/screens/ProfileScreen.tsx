import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMilkData } from '../context/MilkDataContext';
import { AppHeader } from '../components/AppHeader';
import { QuantityStepper } from '../components/QuantityStepper';
import { formatMonthKey } from '../utils/dates';

export const ProfileScreen: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { profile, updateDefaults, changePassword, signOut } = useAuth();
  const { rates, setMonthlyRate } = useMilkData();

  const currentMonthKey = useMemo(() => formatMonthKey(new Date()), []);

  // Steppers state
  const [defaultMorning, setDefaultMorning] = useState(1.0);
  const [defaultEvening, setDefaultEvening] = useState(0.5);

  // Rate state
  const [currentRateText, setCurrentRateText] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const [rateFeedback, setRateFeedback] = useState<string | null>(null);

  // Change password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [retypeNewPass, setRetypeNewPass] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Preferences toggles
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (profile) {
      setDefaultMorning(profile.defaultMorning);
      setDefaultEvening(profile.defaultEvening);
      if (profile.defaultRate !== undefined) {
        setCurrentRateText(String(profile.defaultRate));
      } else if (rates[currentMonthKey] !== undefined) {
        setCurrentRateText(String(rates[currentMonthKey]));
      }
    }
  }, [profile, rates, currentMonthKey]);

  const handleMorningChange = async (val: number) => {
    setDefaultMorning(val);
    await updateDefaults(val, defaultEvening, parseFloat(currentRateText) || undefined);
  };

  const handleEveningChange = async (val: number) => {
    setDefaultEvening(val);
    await updateDefaults(defaultMorning, val, parseFloat(currentRateText) || undefined);
  };

  const handleSaveRate = async () => {
    const num = parseFloat(currentRateText);
    if (isNaN(num) || num <= 0) {
      setRateFeedback('Please enter a valid rate greater than 0.');
      return;
    }

    setSavingRate(true);
    setRateFeedback(null);
    try {
      await updateDefaults(defaultMorning, defaultEvening, num);
      await setMonthlyRate(currentMonthKey, num);
      setRateFeedback('Rate saved for all months.');
      setTimeout(() => setRateFeedback(null), 3000);
    } catch (err: any) {
      setRateFeedback(err?.message || 'Failed to save rate.');
    } finally {
      setSavingRate(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPass || !newPass || !retypeNewPass) {
      setPassError('Please fill in all password fields.');
      return;
    }

    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    if (newPass !== retypeNewPass) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setUpdatingPass(true);
    setPassError(null);
    setPassSuccess(null);
    try {
      await changePassword(currentPass, newPass);
      setPassSuccess('Password updated successfully.');
      setCurrentPass('');
      setNewPass('');
      setRetypeNewPass('');
      setTimeout(() => setPassSuccess(null), 4000);
    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setPassError('Incorrect current password.');
      } else {
        setPassError(err?.message || 'Failed to update password.');
      }
    } finally {
      setUpdatingPass(false);
    }
  };

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
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Profile</Text>

          {/* Card 1: Default Quantity */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Default Quantity
            </Text>
            <View style={styles.stepperContainer}>
              <QuantityStepper
                label="Morning"
                value={defaultMorning}
                onChange={handleMorningChange}
              />
              <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />
              <QuantityStepper
                label="Evening"
                value={defaultEvening}
                onChange={handleEveningChange}
              />
            </View>
          </View>

          {/* Card 2: Manage Milk Rate */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Manage Milk Rate
            </Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Amount per litre (₹) for all months
            </Text>

            <View style={styles.rateInputRow}>
              <TextInput
                style={[
                  styles.rateInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
                value={currentRateText}
                onChangeText={setCurrentRateText}
                keyboardType="numeric"
                placeholder="51"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable
                onPress={handleSaveRate}
                disabled={savingRate}
                style={({ pressed }) => [
                  styles.saveRateBtn,
                  { backgroundColor: colors.primary },
                  savingRate && styles.btnDisabled,
                  pressed && styles.btnPressed,
                ]}
                hitSlop={8}
              >
                {savingRate ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.saveRateBtnText}>Save</Text>
                )}
              </Pressable>
            </View>

            {rateFeedback ? (
              <Text style={[styles.feedbackText, { color: colors.primary }]}>
                {rateFeedback}
              </Text>
            ) : null}

            <Text style={[styles.rateSubtext, { color: colors.textMuted }]}>
              Applies as the standard rate across every month.
            </Text>
          </View>

          {/* Card 3: Change password */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Change password
            </Text>

            {passError ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.statusRedBg }]}>
                <Text style={[styles.errorText, { color: colors.statusRed }]}>{passError}</Text>
              </View>
            ) : null}

            {passSuccess ? (
              <View style={[styles.successBanner, { backgroundColor: colors.statusGreenBg }]}>
                <Text style={[styles.successText, { color: colors.statusGreen }]}>
                  {passSuccess}
                </Text>
              </View>
            ) : null}

            <View style={styles.passForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Current password
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={currentPass}
                  onChangeText={setCurrentPass}
                  placeholder="Current password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  New password
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={newPass}
                  onChangeText={setNewPass}
                  placeholder="New password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Retype new password
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={retypeNewPass}
                  onChangeText={setRetypeNewPass}
                  placeholder="Retype new password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>

              <Pressable
                onPress={handleUpdatePassword}
                disabled={updatingPass}
                style={({ pressed }) => [
                  styles.updatePassBtn,
                  { backgroundColor: colors.primary },
                  updatingPass && styles.btnDisabled,
                  pressed && styles.btnPressed,
                ]}
                hitSlop={8}
              >
                {updatingPass ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.updatePassBtnText}>Update password</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Card 4: Preferences & Dark Mode Toggle */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <View style={styles.preferenceRow}>
              <View>
                <Text style={[styles.preferenceLabel, { color: colors.textPrimary }]}>
                  Dark Theme
                </Text>
                <Text style={[styles.preferenceSubLabel, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.preferenceRow}>
              <Text style={[styles.preferenceLabel, { color: colors.textPrimary }]}>
                Reminders
              </Text>
              <Switch
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.preferenceRow}>
              <Text style={[styles.preferenceLabel, { color: colors.textPrimary }]}>
                Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Sign out button */}
          <Pressable
            onPress={signOut}
            style={({ pressed }) => [
              styles.signOutBtn,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? '#7F1D1D' : '#FECACA',
              },
              pressed && styles.signOutPressed,
            ]}
            hitSlop={8}
          >
            <Text style={[styles.signOutBtnText, { color: colors.statusRed }]}>Sign out</Text>
          </Pressable>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  stepperContainer: {
    gap: 4,
  },
  cardDivider: {
    height: 1,
    marginVertical: 4,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  rateInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  rateInput: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  saveRateBtn: {
    height: 48,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveRateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  rateSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  passForm: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: 4,
  },
  textInput: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  updatePassBtn: {
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  updatePassBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  preferenceSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  errorBanner: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  successBanner: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: 13,
    fontWeight: '500',
  },
  signOutBtn: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  signOutBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  signOutPressed: {
    opacity: 0.8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPressed: {
    opacity: 0.85,
  },
});
