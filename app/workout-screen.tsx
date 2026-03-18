import RingTimer from '@/components/ring-timet';
import StepListItem from '@/components/step-list-item';
import { ROUTINES } from '@/core/data';
import { Routine, StepType } from '@/core/domain/routine';
import { COLORS } from '@/core/styles/colors';
import { FONTS } from '@/core/styles/fonts';
import { RADIUS } from '@/core/styles/radius';
import { SPACING } from '@/core/styles/spacing';
import { useWorkout } from '@/hooks/use-workouts';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHASE_COLORS: Record<StepType, string> = {
  work: COLORS.work,
  rest: COLORS.rest,
  prep: COLORS.prep,
};

const PHASE_LABELS: Record<StepType, string> = {
  work: 'TRABAJO',
  rest: 'DESCANSO',
  prep: 'PREPARACIÓN',
};

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutScreen() {
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const routine = ROUTINES.find(r => r.id === routineId) as Routine | undefined;
  const navigation = useNavigation();
  if (!routine) return null;
  const {
    currentStep,
    secondsLeft,
    elapsed,
    playing,
    finished,
    currentStepData,
    nextStepData,
    progress,
    workSteps,
    completedWorkSteps,
    togglePlay,
    reset,
    totalSteps,
  } = useWorkout(routine);

  const stepListRef = useRef(null);
  const nameAnim = useRef(new Animated.Value(1)).current;

  // Flash exercise name on step change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(nameAnim, { toValue: 0.4, duration: 120, useNativeDriver: true }),
      Animated.timing(nameAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [currentStep]);

  const accentColor = PHASE_COLORS[currentStepData.type] || COLORS.work;
  const remaining = routine.totalSeconds - elapsed;

  if (finished) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.finishContainer}>
          <Text style={styles.finishEmoji}>🔥</Text>
          <Text style={styles.finishTitle}>¡COMPLETADO!</Text>
          <Text style={styles.finishSub}>
            {routine.name} — {formatTime(elapsed)}
          </Text>

          <View style={styles.finishStats}>
            <View style={styles.finishStat}>
              <Text style={styles.finishStatVal}>{formatTime(elapsed)}</Text>
              <Text style={styles.finishStatLabel}>Tiempo</Text>
            </View>
            <View style={styles.finishStatDivider} />
            <View style={styles.finishStat}>
              <Text style={styles.finishStatVal}>{workSteps}</Text>
              <Text style={styles.finishStatLabel}>Series</Text>
            </View>
            <View style={styles.finishStatDivider} />
            <View style={styles.finishStat}>
              <Text style={styles.finishStatVal}>~{Math.round(elapsed / 60 * 8)}</Text>
              <Text style={styles.finishStatLabel}>Kcal est.</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: accentColor }]}
            onPress={reset}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryText}>REPETIR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecondaryText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
    <Stack.Screen
      options={{
          headerShown: false
      }}
    />
  
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Nav bar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => { reset(); navigation.goBack(); }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← Rutinas</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{routine.name}</Text>
        <Text style={styles.navTime}>{formatTime(remaining)}</Text>
      </View>

      <ScrollView
        ref={stepListRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase label */}
        <View style={styles.phaseRow}>
          <View style={[styles.phaseDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.phaseLabel, { color: accentColor }]}>
            {PHASE_LABELS[currentStepData.type]}
          </Text>
        </View>

        {/* Exercise name */}
        <Animated.Text style={[styles.exerciseName, { opacity: nameAnim }]} numberOfLines={2}>
          {currentStepData.name}
        </Animated.Text>
        <Text style={styles.exerciseNote} numberOfLines={2}>
          {currentStepData.note}
        </Text>

        {/* Ring timer */}
        <View style={styles.ringContainer}>
          <RingTimer
            secondsLeft={secondsLeft}
            totalDur={currentStepData.dur}
            type={currentStepData.type}
          />
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {completedWorkSteps}/{workSteps} series
            </Text>
            <Text style={styles.progressText}>
              {formatTime(elapsed)} / {routine.duration}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: accentColor },
              ]}
            />
          </View>
        </View>

        {/* Next card */}
        {nextStepData && (
          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>A CONTINUACIÓN</Text>
            <Text style={styles.nextName}>{nextStepData.name}</Text>
            <Text style={styles.nextDur}>{nextStepData.dur}s</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={reset}
            activeOpacity={0.7}
          >
            <Text style={styles.resetBtnText}>↺</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: accentColor }]}
            onPress={togglePlay}
            activeOpacity={0.85}
          >
            <Text style={styles.playBtnText}>
              {playing ? 'PAUSAR' : elapsed === 0 ? 'COMENZAR' : 'CONTINUAR'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step list */}
        <View style={styles.stepList}>
          <Text style={styles.stepListHeader}>PROGRAMA COMPLETO</Text>
          {routine.steps.map((step: any, i: number) => (
            <StepListItem
              key={i}
              step={step}
              index={i}
              isCurrent={i === currentStep}
              isDone={i < currentStep}
              isNext={i === currentStep + 1}
            />
          ))}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
    </>
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
  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSub,
  },
  navTitle: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 1,
  },
  navTime: {
    fontFamily: FONTS.display,
    fontSize: 16,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  // Phase + exercise
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  phaseLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  exerciseName: {
    fontFamily: FONTS.display,
    fontSize: 42,
    color: COLORS.text,
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    marginTop: 4,
    lineHeight: 46,
  },
  exerciseNote: {
    fontFamily: FONTS.bodyLight,
    fontSize: 13,
    color: COLORS.textSub,
    paddingHorizontal: SPACING.md,
    marginTop: 4,
    lineHeight: 18,
    minHeight: 18,
  },

  // Ring
  ringContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },

  // Progress
  progressSection: {
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },

  // Next card
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  nextLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  nextName: {
    fontFamily: FONTS.display,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: 0.5,
    flex: 1,
  },
  nextDur: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: 10,
  },
  resetBtn: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.textSub,
  },
  playBtn: {
    flex: 1,
    height: 54,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.black,
    letterSpacing: 2,
  },

  // Step list
  stepList: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  stepListHeader: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // Finish screen
  finishContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  finishEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  finishTitle: {
    fontFamily: FONTS.display,
    fontSize: 52,
    color: COLORS.accent,
    letterSpacing: 2,
  },
  finishSub: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSub,
    letterSpacing: 1,
  },
  finishStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
    marginVertical: SPACING.lg,
  },
  finishStat: {
    alignItems: 'center',
    gap: 4,
  },
  finishStatVal: {
    fontFamily: FONTS.display,
    fontSize: 36,
    color: COLORS.accent,
    lineHeight: 38,
  },
  finishStatLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  finishStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  btnPrimary: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.black,
    letterSpacing: 2.5,
  },
  btnSecondary: {
    paddingVertical: 12,
  },
  btnSecondaryText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSub,
  },
});
