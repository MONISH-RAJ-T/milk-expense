import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Spacing } from '../theme/colors';
import {
  generateCalendarGrid,
  formatMonthHeader,
  CalendarDay,
} from '../utils/dates';
import { EntryData, deriveStatus } from '../utils/calculations';

interface CalendarProps {
  year: number;
  monthIndex: number;
  selectedDateKey: string;
  entries: Record<string, EntryData>;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  year,
  monthIndex,
  selectedDateKey,
  entries,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) => {
  const { colors, isDark } = useTheme();

  const days = useMemo(
    () => generateCalendarGrid(year, monthIndex),
    [year, monthIndex]
  );

  const headerTitle = formatMonthHeader(year, monthIndex);
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getStatusColor = (day: CalendarDay) => {
    if (day.isFuture || !day.isCurrentMonth) return null;

    const entry = entries[day.dateKey];
    if (entry) {
      const status = entry.status || deriveStatus(entry.morning, entry.evening);
      if (status === 'twice') return colors.statusGreen;
      if (status === 'once') return colors.statusAmber;
      return colors.statusRed;
    }
    // Default if not saved yet
    return colors.statusRed;
  };

  return (
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
      {/* Month Navigation Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {headerTitle}
        </Text>
        <View style={styles.navRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={onPrevMonth}
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: colors.navBtnBg },
              pressed && styles.navBtnPressed,
            ]}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={18} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={onNextMonth}
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: colors.navBtnBg },
              pressed && styles.navBtnPressed,
            ]}
            hitSlop={8}
          >
            <Feather name="chevron-right" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Weekday Labels Header */}
      <View
        style={[
          styles.weekdaysRow,
          {
            backgroundColor: isDark ? 'rgba(51, 65, 85, 0.4)' : '#F8FAFC',
          },
        ]}
      >
        {weekdays.map((w, index) => (
          <View key={`${w}-${index}`} style={styles.weekdayCol}>
            <Text
              style={[
                styles.weekdayText,
                {
                  color: index === 0 || index === 6 ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Days Grid */}
      <View style={styles.grid}>
        {days.map((day) => {
          const isSelected = day.dateKey === selectedDateKey;
          const isTappable = day.isEditable;
          const statusColor = getStatusColor(day);

          return (
            <View key={day.dateKey} style={styles.dayCol}>
              <Pressable
                disabled={!isTappable}
                onPress={() => isTappable && onSelectDate(day.dateKey)}
                style={({ pressed }) => [
                  styles.dayPressable,
                  !isSelected && day.isToday && [
                    styles.todayBadge,
                    {
                      backgroundColor: colors.todayBadgeBg,
                      borderColor: colors.todayBadgeBorder,
                    },
                  ],
                  isSelected && styles.selectedBadge,
                  pressed && isTappable && styles.dayPressed,
                ]}
                hitSlop={4}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.textPrimary },
                    !day.isCurrentMonth && {
                      color: colors.textMuted,
                      opacity: 0.35,
                    },
                    day.isFuture && {
                      color: colors.textMuted,
                      opacity: 0.45,
                    },
                    !isSelected && day.isToday && {
                      color: colors.primary,
                      fontWeight: '800',
                    },
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {day.dayNumber}
                </Text>

                {/* Status Dot */}
                {statusColor ? (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isSelected ? '#FFFFFF' : statusColor,
                      },
                    ]}
                  />
                ) : (
                  <View style={styles.dotPlaceholder} />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Modern Capsule Legend */}
      <View
        style={[
          styles.legendContainer,
          { backgroundColor: colors.legendBg, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.statusGreen }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Twice</Text>
        </View>
        <View style={styles.legendDivider} />
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.statusAmber }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Once</Text>
        </View>
        <View style={styles.legendDivider} />
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.statusRed }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>None</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCol: {
    width: '14.285%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  dayPressable: {
    width: 40,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  dayPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  todayBadge: {
    borderWidth: 1.5,
  },
  selectedBadge: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: Spacing.md,
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
    fontWeight: '600',
  },
  legendDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    opacity: 0.5,
  },
});
