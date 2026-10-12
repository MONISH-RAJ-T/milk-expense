import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { PurchaseStatus } from '../utils/calculations';

interface StatusChipProps {
  status: PurchaseStatus;
  label?: string;
  count?: number;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  count,
  size = 'small',
}) => {
  let text = label;
  if (!text) {
    if (status === 'twice') {
      text = count !== undefined ? `Twice ${count}` : 'Bought twice';
    } else if (status === 'once') {
      text = count !== undefined ? `Once ${count}` : 'Bought once';
    } else {
      text = count !== undefined ? `None ${count}` : 'None';
    }
  }

  const isSmall = size === 'small';

  const getStyle = () => {
    switch (status) {
      case 'twice':
        return {
          bg: Colors.statusGreenBg,
          text: Colors.statusGreen,
        };
      case 'once':
        return {
          bg: Colors.statusAmberBg,
          text: Colors.statusAmber,
        };
      case 'none':
      default:
        return {
          bg: Colors.statusRedBg,
          text: Colors.statusRed,
        };
    }
  };

  const styleConfig = getStyle();

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: styleConfig.bg },
        isSmall ? styles.chipSmall : styles.chipMedium,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: styleConfig.text },
          isSmall ? styles.textSmall : styles.textMedium,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: BorderRadius.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipMedium: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 13,
  },
});
