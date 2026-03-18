import { Level, Routine } from '@/core/domain/routine';
import { COLORS } from '@/core/styles/colors';
import { FONTS } from '@/core/styles/fonts';
import { RADIUS } from '@/core/styles/radius';
import { SPACING } from '@/core/styles/spacing';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';



interface Props {
    routine: Routine;
    onPress: () => void;
}

const LEVEL_ICONS: Record<Level, string> = {
  beginner: '○',
  intermediate: '◑',
  advanced: '●',
};

export default function RoutineCard({ routine, onPress }: Props) {
  const icon = LEVEL_ICONS[routine.level] || '○';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.accentBar, { backgroundColor: routine.color }]} />
      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{routine.name}</Text>
            <View style={[styles.levelBadge, {
              borderColor: routine.color + '40',
              backgroundColor: routine.color + '12',
            }]}>
              <Text style={[styles.levelIcon, { color: routine.color }]}>{icon}</Text>
              <Text style={[styles.levelText, { color: routine.color }]}>{routine.level}</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>{routine.description}</Text>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{routine.duration}</Text>
            <Text style={styles.metaLabel}>duración</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{routine.exercises}</Text>
            <Text style={styles.metaLabel}>ejercicios</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{routine.steps.filter(s => s.type === 'work').length}</Text>
            <Text style={styles.metaLabel}>series</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={[styles.arrow, { color: routine.color }]}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  accentBar: { width: 3 },
  content: { flex: 1, padding: SPACING.md, gap: SPACING.md },
  top: { gap: SPACING.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: 28, color: COLORS.text, letterSpacing: 1, flex: 1,
  },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  levelIcon: { fontSize: 9 },
  levelText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
  },
  description: {
    fontFamily: FONTS.bodyLight,
    fontSize: 13, color: COLORS.textSub, lineHeight: 19,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  metaItem: { alignItems: 'flex-start' },
  metaValue: {
    fontFamily: FONTS.display,
    fontSize: 20, color: COLORS.text, lineHeight: 22,
  },
  metaLabel: {
    fontFamily: FONTS.body,
    fontSize: 10, color: COLORS.textMuted,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  metaDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
  arrowContainer: { flex: 1, alignItems: 'flex-end' },
  arrow: { fontFamily: FONTS.display, fontSize: 22 },
});
