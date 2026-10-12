import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing } from '../theme/colors';

interface QuantityStepperProps {
  label?: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  unit?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  label,
  value,
  step = 0.25,
  min = 0,
  max = 50,
  onChange,
  unit = 'L',
}) => {
  const { colors } = useTheme();

  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 100) / 100);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * 100) / 100);
    onChange(next);
  };

  const displayValue = `${value} ${unit}`;

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.stepperRow,
          {
            backgroundColor: colors.stepperBg,
            borderColor: colors.stepperBorder,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label || 'quantity'}`}
          onPress={handleDecrement}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            value <= min && styles.buttonDisabled,
          ]}
          hitSlop={8}
          disabled={value <= min}
        >
          <Text
            style={[
              styles.buttonText,
              { color: colors.textPrimary },
              value <= min && { color: colors.disabledText },
            ]}
          >
            −
          </Text>
        </Pressable>

        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: colors.textPrimary }]}>
            {displayValue}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label || 'quantity'}`}
          onPress={handleIncrement}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          hitSlop={8}
        >
          <Text style={[styles.buttonText, { color: colors.textPrimary }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 24,
  },
  valueContainer: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

