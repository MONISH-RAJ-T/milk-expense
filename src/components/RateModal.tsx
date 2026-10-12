import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { getMonthName } from '../utils/dates';

interface RateModalProps {
  visible: boolean;
  monthKey: string;
  currentRate: number;
  onClose: () => void;
  onSave: (monthKey: string, rate: number) => Promise<void>;
}

export const RateModal: React.FC<RateModalProps> = ({
  visible,
  monthKey,
  currentRate,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const [rateText, setRateText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setRateText(currentRate > 0 ? String(currentRate) : '');
      setSaving(false);
    }
  }, [visible, currentRate]);

  const monthName = monthKey
    ? getMonthName(parseInt(monthKey.split('-')[1], 10) - 1)
    : '';

  const handleSave = async () => {
    const num = parseFloat(rateText);
    if (isNaN(num) || num <= 0) return;
    setSaving(true);
    try {
      await onSave(monthKey, num);
      onClose();
    } catch (e) {
      // error handled in caller
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Edit Milk Rate</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Set amount per litre for {monthName}
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Text style={[styles.currencyPrefix, { color: colors.textPrimary }]}>₹</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={rateText}
              onChangeText={setRateText}
              keyboardType="numeric"
              placeholder="e.g. 56"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                pressed && styles.btnPressed,
              ]}
              hitSlop={8}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving || !rateText}
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: colors.primary },
                (saving || !rateText) && styles.saveBtnDisabled,
                pressed && styles.btnPressed,
              ]}
              hitSlop={8}
            >
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Rate'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    height: 52,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    height: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  btnPressed: {
    opacity: 0.8,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});
