import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MonthlySummary, EntryData, formatCurrency, formatLitres } from '../utils/calculations';
import { getMonthName } from '../utils/dates';

interface MonthCardProps {
  summary: MonthlySummary;
  index?: number;
  entries?: Record<string, EntryData>;
  isCurrentMonth?: boolean;
  onEditRate: (monthKey: string, currentRate: number) => void;
  onSelectMonth?: (monthKey: string) => void;
}

const GRADIENTS: [string, string][] = [
  ['#3B82F6', '#4F46E5'], // Oct / Card 0: Royal Blue to Indigo
  ['#38BDF8', '#2563EB'], // Sep / Card 1: Bright Cyan to Ocean Blue
  ['#4ADE80', '#059669'], // Aug / Card 2: Fresh Mint to Emerald Green
  ['#8B5CF6', '#6366F1'], // Purple to Indigo
  ['#F59E0B', '#D97706'], // Amber
  ['#EC4899', '#BE185D'], // Rose
];

const PASTEL_TINTS = [
  'rgba(255, 255, 255, 0.9)',
  '#BAE6FD',
  'rgba(255, 255, 255, 0.75)',
  '#FDE68A',
  '#FED7AA',
  'rgba(255, 255, 255, 0.85)',
  '#DDD6FE',
  'rgba(255, 255, 255, 0.7)',
  '#A7F3D0',
  'rgba(255, 255, 255, 0.9)',
  '#FBCFE8',
  'rgba(255, 255, 255, 0.8)',
  '#BAE6FD',
  'rgba(255, 255, 255, 0.85)',
];

export const MonthCard = React.memo<MonthCardProps>(({
  summary,
  index = 0,
  entries,
  onEditRate,
  onSelectMonth,
}) => {
  const [, monthStr] = summary.monthKey.split('-');
  const monthName = getMonthName(parseInt(monthStr, 10) - 1);

  const gradientColors = GRADIENTS[index % GRADIENTS.length];

  const handleEditPress = (e: any) => {
    e.stopPropagation?.();
    onEditRate(summary.monthKey, summary.ratePerLitre);
  };

  const handleCardPress = () => {
    if (onSelectMonth) {
      onSelectMonth(summary.monthKey);
    }
  };

  const barsData = useMemo(() => {
    const [yearStr, mStr] = summary.monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(mStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const barCount = 13;
    const step = Math.max(1, Math.floor(daysInMonth / barCount));
    const bars = [];

    for (let i = 0; i < barCount; i++) {
      const day = Math.min(daysInMonth, 1 + i * step);
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateKey = `${summary.monthKey}-${dayStr}`;
      const entry = entries ? entries[dateKey] : undefined;

      let litres = 0;
      if (entry) {
        litres = (Number(entry.morning) || 0) + (Number(entry.evening) || 0);
      }

      let height = 12;
      if (litres > 0) {
        height = Math.min(46, Math.max(14, Math.round(litres * 18)));
      } else if (summary.totalLitres > 0) {
        const pseudoHeights = [16, 26, 38, 42, 28, 18, 34, 46, 22, 30, 24, 40, 16];
        height = pseudoHeights[i % pseudoHeights.length];
      } else {
        const baseHeights = [14, 22, 30, 36, 26, 20, 34, 28, 16, 32, 22, 38, 20];
        height = baseHeights[i % baseHeights.length];
      }

      bars.push({
        height,
        color: index === 0 ? PASTEL_TINTS[i % PASTEL_TINTS.length] : 'rgba(255, 255, 255, 0.8)',
      });
    }
    return bars;
  }, [summary.monthKey, summary.totalLitres, entries, index]);

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Full card background touch target */}
        <Pressable
          onPress={handleCardPress}
          style={({ pressed }) => [StyleSheet.absoluteFill, pressed && styles.cardPressed]}
          accessibilityRole="button"
          accessibilityLabel={`View ${monthName} summary`}
        />

        {/* Top Row: Month Name and Total Cost */}
        <View style={styles.topRow} pointerEvents="none">
          <Text style={styles.monthName}>{monthName}</Text>
          <Text style={styles.totalCost}>{formatCurrency(summary.totalCost)}</Text>
        </View>

        {/* Subtitle Row: Litres bought and Rate with trend */}
        <View style={styles.subtitleRow}>
          <Text style={styles.litresBought} pointerEvents="none">
            {formatLitres(summary.totalLitres)} bought
          </Text>
          <Pressable
            onPress={handleEditPress}
            style={({ pressed }) => [
              styles.rateTouchable,
              pressed && styles.ratePressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit rate"
          >
            <Text style={styles.rateText}>
              {summary.ratePerLitre > 0
                ? `₹${summary.ratePerLitre} / L • ₹${summary.ratePerLitre} ↗`
                : 'Set rate ↗'}
            </Text>
          </Pressable>
        </View>

        {/* Micro-bars Visual */}
        <View style={styles.barsContainer} pointerEvents="none">
          {barsData.map((bar, barIdx) => (
            <View
              key={barIdx}
              style={[
                styles.bar,
                {
                  height: bar.height,
                  backgroundColor: bar.color,
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
});

MonthCard.displayName = 'MonthCard';

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  cardGradient: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  monthName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  totalCost: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  litresBought: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  rateTouchable: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  ratePressed: {
    opacity: 0.6,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 48,
    gap: 8,
    paddingTop: 4,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
});
