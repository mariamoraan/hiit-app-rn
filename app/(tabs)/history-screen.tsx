import { ROUTINES } from '@/core/data';
import { Session } from '@/core/domain/routine';
import { clearHistory, getSessions } from '@/core/storage';
import { COLORS } from '@/core/styles/colors';
import { FONTS } from '@/core/styles/fonts';
import { RADIUS } from '@/core/styles/radius';
import { SPACING } from '@/core/styles/spacing';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HistoryScreen() {
const navigation = useNavigation();
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSessions().then(setSessions);
    }, [])
  );

  const totalMinutes = sessions.reduce((acc, s) => acc + Math.round(s.durationSeconds / 60), 0);
  const routineCounts = sessions.reduce((acc, s) => {
    acc[s.routineName] = (acc[s.routineName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleClear = () => {
    Alert.alert(
      'Borrar historial',
      '¿Segura? Se eliminarán todas las sesiones guardadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setSessions([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Sin sesiones aún</Text>
            <Text style={styles.emptySub}>
              Completa tu primer entrenamiento y aquí aparecerá tu historial.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyBtnText}>EMPEZAR AHORA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary stats */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{sessions.length}</Text>
                <Text style={styles.summaryLabel}>sesiones</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{totalMinutes}</Text>
                <Text style={styles.summaryLabel}>minutos</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>~{totalMinutes * 8}</Text>
                <Text style={styles.summaryLabel}>kcal est.</Text>
              </View>
            </View>

            {/* Routine breakdown */}
            <Text style={styles.sectionLabel}>POR RUTINA</Text>
            <View style={styles.breakdownCard}>
              {Object.entries(routineCounts).map(([name, count], i) => {
                const routine = ROUTINES.find(r => r.name === name);
                return (
                  <View
                    key={name}
                    style={[
                      styles.breakdownItem,
                      i < Object.keys(routineCounts).length - 1 && styles.breakdownBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: routine?.color || COLORS.accent },
                      ]}
                    />
                    <Text style={styles.breakdownName}>{name}</Text>
                    <Text style={styles.breakdownCount}>{count}×</Text>
                  </View>
                );
              })}
            </View>

            {/* Session list */}
            <Text style={styles.sectionLabel}>SESIONES</Text>
            <View style={styles.sessionList}>
              {sessions.map((session, i) => {
                const routine = ROUTINES.find(r => r.id === session.routineId);
                return (
                  <View
                    key={session.id}
                    style={[
                      styles.sessionItem,
                      i < sessions.length - 1 && styles.sessionBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.sessionBar,
                        { backgroundColor: routine?.color || COLORS.accent },
                      ]}
                    />
                    <View style={styles.sessionContent}>
                      <View style={styles.sessionTop}>
                        <Text style={styles.sessionName}>{session.routineName}</Text>
                        <Text style={styles.sessionTime}>{formatTime(session.durationSeconds)}</Text>
                      </View>
                      <View style={styles.sessionBottom}>
                        <Text style={styles.sessionLevel}>{session.routineLevel}</Text>
                        <Text style={styles.sessionDate}>{formatDate(session.completedAt)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  backBtn: { paddingVertical: 4 },
  backText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSub,
  },
  navTitle: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 2,
  },
  clearText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.danger,
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
    gap: SPACING.sm,
  },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: 28,
    color: COLORS.text,
    letterSpacing: 1,
    marginTop: SPACING.sm,
  },
  emptySub: {
    fontFamily: FONTS.bodyLight,
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  emptyBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  emptyBtnText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.black,
    letterSpacing: 2,
  },

  // Summary
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  summaryItem: { alignItems: 'center' },
  summaryVal: {
    fontFamily: FONTS.display,
    fontSize: 30,
    color: COLORS.accent,
    lineHeight: 32,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },

  sectionLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },

  // Breakdown
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: 10,
  },
  breakdownBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownName: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  breakdownCount: {
    fontFamily: FONTS.display,
    fontSize: 18,
    color: COLORS.textSub,
  },

  // Session list
  sessionList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sessionItem: {
    flexDirection: 'row',
  },
  sessionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sessionBar: {
    width: 3,
  },
  sessionContent: {
    flex: 1,
    padding: SPACING.md,
    gap: 4,
  },
  sessionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionName: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  sessionTime: {
    fontFamily: FONTS.display,
    fontSize: 18,
    color: COLORS.textSub,
  },
  sessionBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionLevel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  sessionDate: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
