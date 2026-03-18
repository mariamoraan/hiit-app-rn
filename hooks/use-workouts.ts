import { Routine, Session } from '@/core/domain/routine';
import { hapticCountdown, hapticPhaseChange, hapticSuccess } from '@/core/haptics';
import { saveSession } from '@/core/storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useWorkout(routine: Routine) {
  const [currentStep, setCurrentStep] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(routine.steps[0].dur);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);
  const secsRef = useRef(routine.steps[0].dur);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const steps = routine.steps;

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const advanceStep = useCallback(async (nextStep: number) => {
    if (nextStep >= steps.length) {
      // Finished
      clearTimer();
      setPlaying(false);
      setFinished(true);
      await hapticSuccess();

      const session: Session = {
        id: Date.now().toString(),
        routineId: routine.id,
        routineName: routine.name,
        routineLevel: routine.level,
        completedAt: new Date().toISOString(),
        durationSeconds: elapsedRef.current,
      };
      await saveSession(session);
      return;
    }

    const prevType = steps[stepRef.current]?.type;
    const nextType = steps[nextStep]?.type;

    stepRef.current = nextStep;
    secsRef.current = steps[nextStep].dur;

    setCurrentStep(nextStep);
    setSecondsLeft(steps[nextStep].dur);

    // Haptic on phase change
    if (prevType !== nextType) {
      await hapticPhaseChange(nextType === 'work');
    }
  }, [steps, routine]);

  const tick = useCallback(async () => {
    secsRef.current -= 1;
    elapsedRef.current += 1;

    setSecondsLeft(secsRef.current);
    setElapsed(elapsedRef.current);

    // Countdown haptics on last 3 secs of work
    if (
      steps[stepRef.current]?.type === 'work' &&
      secsRef.current <= 3 &&
      secsRef.current > 0
    ) {
      await hapticCountdown();
    }

    if (secsRef.current <= 0) {
      await advanceStep(stepRef.current + 1);
    }
  }, [steps, advanceStep]);

  const play = useCallback(() => {
    if (finished) return;
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    setPlaying(true);
    timerRef.current = setInterval(tick, 1000);
  }, [tick, finished]);

  const pause = useCallback(() => {
    clearTimer();
    setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  const reset = useCallback(() => {
    clearTimer();
    setPlaying(false);
    setFinished(false);
    setCurrentStep(0);
    setSecondsLeft(steps[0].dur);
    setElapsed(0);
    stepRef.current = 0;
    secsRef.current = steps[0].dur;
    elapsedRef.current = 0;
    startTimeRef.current = null;
  }, [steps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, []);

  const currentStepData = steps[currentStep] || steps[0];
  const nextStepData = steps[currentStep + 1] || null;
  const totalSeconds = routine.totalSeconds;
  const progress = elapsed / totalSeconds;

  const workSteps = steps.filter(s => s.type === 'work');
  const completedWorkSteps = steps
    .slice(0, currentStep + 1)
    .filter(s => s.type === 'work').length;

  return {
    currentStep,
    secondsLeft,
    elapsed,
    playing,
    finished,
    currentStepData,
    nextStepData,
    progress: Math.min(progress, 1),
    workSteps: workSteps.length,
    completedWorkSteps,
    togglePlay,
    reset,
    totalSteps: steps.length,
  };
}
