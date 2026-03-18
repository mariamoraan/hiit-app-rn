import { Step, StepType } from '@/core/domain/routine';
import { COLORS } from '@/core/styles/colors';
import { FONTS } from '@/core/styles/fonts';
import { RADIUS } from '@/core/styles/radius';
import { SPACING } from '@/core/styles/spacing';
import { StyleSheet, Text, View } from 'react-native';

const PHASE_COLORS: Record<StepType, string>= {
  work: COLORS.work,
  rest: COLORS.rest,
  prep: COLORS.prep,
};

const PHASE_LABELS: Record<StepType, string> = {
  work: 'TRABAJO',
  rest: 'DESCANSO',
  prep: 'PREP',
};

interface Props {
    step: Step,
    index: number,
    isCurrent: boolean,
    isDone: boolean,
    isNext: boolean
}

export default function StepListItem({ step, index, isCurrent, isDone, isNext }: Props) {
  const color = PHASE_COLORS[step.type] || COLORS.work;

  return (
    <View 
    style={[
      styles.item,
      isCurrent && styles.itemActive,
      isDone && styles.itemDone,
    ]}
    >
      {isCurrent && <View style={[styles.activeDot, { backgroundColor: color }]} />}

      <Text style={[styles.num, isDone && styles.numDone]}>
        {isDone ? '✓' : String(index + 1).padStart(2, '0')}
      </Text>

      <Text style={[styles.name, isDone && styles.nameDone]} numberOfLines={1}>
        {step.name}
      </Text>

      <View style={[styles.badge, {
        backgroundColor: color + (isDone ? '08' : '15'),
        borderColor: color + (isDone ? '15' : '30'),
      }]}>
        <Text style={[styles.badgeText, { color: isDone ? COLORS.textMuted : color }]}>
          {PHASE_LABELS[step.type]}
        </Text>
      </View>

      <Text style={[styles.dur, isDone && styles.durDone]}>{step.dur}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
    gap: 10,
    position: 'relative',
  },
  itemActive: {
    backgroundColor: '#161616',
  },
  itemDone: {
    opacity: 0.35,
  },
  activeDot: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 2,
    borderRadius: 1,
  },
  num: {
    fontFamily: FONTS.display,
    fontSize: 13,
    color: COLORS.textMuted,
    width: 22,
  },
  numDone: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  name: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  nameDone: {
    color: COLORS.textMuted,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  dur: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    width: 28,
    textAlign: 'right',
  },
  durDone: {
    color: COLORS.textMuted,
  },
});
