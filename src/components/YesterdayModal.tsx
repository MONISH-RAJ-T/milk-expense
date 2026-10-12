import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { QuantityStepper } from './QuantityStepper';
import { formatDisplayDate } from '../utils/dates';

interface YesterdayModalProps {
  visible: boolean;
  dateKey: string;
  initialMorning: number;
  initialEvening: number;
  onClose: () => void;
  onSave: (dateKey: string, morning: number, evening: number) => Promise<void>;
}

export const YesterdayModal: React.FC<YesterdayModalProps> = ({
  visible,
  dateKey,
  initialMorning,
  initialEvening,
  onClose,
  onSave,
}) => {
  const [morning, setMorning] = useState(initialMorning);
  const [evening, setEvening] = useState(initialEvening);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setMorning(initialMorning);
      setEvening(initialEvening);
      setSaving(false);
    }
  }, [visible, initialMorning, initialEvening]);

  const displayDate = dateKey ? formatDisplayDate(dateKey) : '';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(dateKey, morning, evening);
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
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit Entry</Text>
          <Text style={styles.subtitle}>{displayDate}</Text>

          <View style={styles.stepperContainer}>
            <QuantityStepper
              label="Morning"
              value={morning}
              onChange={setMorning}
            />
            <View style={styles.divider} />
            <QuantityStepper
              label="Evening"
              value={evening}
              onChange={setEvening}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
              hitSlop={8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveBtn,
                saving && styles.saveBtnDisabled,
                pressed && styles.btnPressed,
              ]}
              hitSlop={8}
            >
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
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
  stepperContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
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
