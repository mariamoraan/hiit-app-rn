import RoutineCard from '@/components/routine-card';
import { ROUTINES } from '@/core/data';
import { Session } from '@/core/domain/routine';
import { getSessions } from '@/core/storage';
import { COLORS } from '@/core/styles/colors';
import { FONTS } from '@/core/styles/fonts';
import { SPACING } from '@/core/styles/spacing';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSessions().then(setSessions);
    }, [])
  );

  const totalMinutes = sessions.reduce((acc, s) => acc + Math.round(s.durationSeconds / 60), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>HIIT</Text>
            <Text style={styles.tagline}>Cardio de arranque</Text>
          </View>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => router.push('/(tabs)/history-screen')}
            activeOpacity={0.7}
          >
            <Text style={styles.historyBtnText}>Historial</Text>
            {sessions.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{sessions.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        {sessions.length > 0 && (
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{sessions.length}</Text>
              <Text style={styles.statLabel}>sesiones</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{totalMinutes}</Text>
              <Text style={styles.statLabel}>minutos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>
                {sessions[0]
                  ? ROUTINES.find(r => r.id === sessions[0].routineId)?.name || '—'
                  : '—'}
              </Text>
              <Text style={styles.statLabel}>último</Text>
            </View>
          </View>
        )}

        {/* Section title */}
        <Text style={styles.sectionTitle}>ELIGE TU ENTRENO</Text>

        {/* Routine cards */}
        {ROUTINES.map(routine => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            onPress={() =>
              router.push({ pathname: '/workout-screen', params: { routineId: routine.id } })
            }
          />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Empieza por Arranque y sube cuando 7 min se queden cortos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  appName: {
    fontFamily: FONTS.display,
    fontSize: 52,
    color: COLORS.accent,
    letterSpacing: 2,
    lineHeight: 52,
  },
  tagline: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  historyBtnText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSub,
  },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.black,
  },
  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.accent,
    lineHeight: 24,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  footer: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  footerText: {
    fontFamily: FONTS.bodyLight,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
});
