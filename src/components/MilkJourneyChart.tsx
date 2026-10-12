import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle, Text as SvgText } from 'react-native-svg';
import { Colors, BorderRadius, Spacing } from '../theme/colors';

interface MilkJourneyChartProps {
  data?: number[];
  labels?: string[];
}

export const MilkJourneyChart: React.FC<MilkJourneyChartProps> = ({
  data = [3.2, 5.5, 4.0, 4.8, 3.5, 6.2],
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
}) => {
  const chartWidth = 300;
  const chartHeight = 130;
  const paddingX = 24;
  const paddingY = 20;

  const minVal = 1.0;
  const maxVal = 7.0;

  const getX = (index: number) => {
    return paddingX + (index * (chartWidth - 2 * paddingX)) / (labels.length - 1);
  };

  const getY = (val: number) => {
    const clamped = Math.min(Math.max(val, minVal), maxVal);
    const ratio = (clamped - minVal) / (maxVal - minVal);
    return chartHeight - paddingY - ratio * (chartHeight - 2 * paddingY);
  };

  // Build smooth bezier path
  const points = data.map((val, idx) => ({ x: getX(idx), y: getY(val) }));

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    linePath += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your Milk Journey</Text>
      <Text style={styles.subtitle}>Volume (L) over 6 Months</Text>

      <View style={styles.svgContainer}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Defs>
            <SvgGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#2F6FED" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#2F6FED" stopOpacity="0.0" />
            </SvgGradient>
          </Defs>

          {/* Area Fill */}
          <Path d={areaPath} fill="url(#areaGradient)" />

          {/* Smooth Line */}
          <Path
            d={linePath}
            fill="none"
            stroke="#2F6FED"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <Circle
              key={`point-${idx}`}
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill="#FFFFFF"
              stroke="#2F6FED"
              strokeWidth="2"
            />
          ))}

          {/* Month labels along bottom */}
          {labels.map((label, idx) => (
            <SvgText
              key={`label-${idx}`}
              x={getX(idx)}
              y={chartHeight - 2}
              fontSize="10"
              fontWeight="600"
              fill={Colors.textMuted}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}
        </Svg>
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
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
});
