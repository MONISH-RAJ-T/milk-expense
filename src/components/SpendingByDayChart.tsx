import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme/colors';

interface DaySpending {
  day: string;
  morning: number;
  evening: number;
}

interface SpendingByDayChartProps {
  data?: DaySpending[];
}

export const SpendingByDayChart: React.FC<SpendingByDayChartProps> = ({
  data = [
    { day: 'Mon', morning: 40, evening: 55 },
    { day: 'Tue', morning: 65, evening: 35 },
    { day: 'Wed', morning: 50, evening: 25 },
    { day: 'Thu', morning: 60, evening: 45 },
    { day: 'Fri', morning: 55, evening: 50 },
    { day: 'Sat', morning: 70, evening: 40 },
    { day: 'Sun', morning: 60, evening: 30 },
  ],
}) => {
  const maxVal = 80;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Spending by Day</Text>

      <View style={styles.chartArea}>
        {data.map((item, idx) => {
          const morningHeight = Math.min(75, (item.morning / maxVal) * 75);
          const eveningHeight = Math.min(75, (item.evening / maxVal) * 75);

          return (
            <View key={`day-${idx}`} style={styles.dayCol}>
              <View style={styles.barsContainer}>
                <View
                  style={[
                    styles.bar,
                    { height: morningHeight, backgroundColor: '#2F6FED' },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    { height: eveningHeight, backgroundColor: '#74B3FD' },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2F6FED' }]} />
          <Text style={styles.legendText}>Morning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#74B3FD' }]} />
          <Text style={styles.legendText}>Evening</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    paddingHorizontal: 4,
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 75,
  },
  bar: {
    width: 9,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: Spacing.md,
    paddingTop: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
