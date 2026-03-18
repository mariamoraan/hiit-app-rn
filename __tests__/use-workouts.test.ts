import { renderHook, act } from '@testing-library/react-native';
import { useWorkout } from '@/hooks/use-workouts';
import { Level, StepType, type Routine } from '@/core/domain/routine';

jest.mock('@/core/haptics', () => ({
  hapticCountdown: jest.fn().mockResolvedValue(undefined),
  hapticPhaseChange: jest.fn().mockResolvedValue(undefined),
  hapticSuccess: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/core/storage', () => ({
  saveSession: jest.fn().mockResolvedValue(undefined),
}));

const haptics = jest.requireMock('@/core/haptics') as {
  hapticCountdown: jest.Mock;
  hapticPhaseChange: jest.Mock;
  hapticSuccess: jest.Mock;
};

const storage = jest.requireMock('@/core/storage') as {
  saveSession: jest.Mock;
};

function makeRoutine(): Routine {
  return {
    id: 'r1',
    name: 'Test routine',
    description: 'desc',
    color: '#000',
    level: Level.beginner,
    duration: '0:10',
    exercises: 1,
    totalSeconds: 9,
    steps: [
      { type: StepType.prep, name: 'Prep', note: '', dur: 2 },
      { type: StepType.work, name: 'Work', note: '', dur: 5 },
      { type: StepType.rest, name: 'Rest', note: '', dur: 2 },
    ],
  };
}

describe('useWorkout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ticks, advances steps, and finishes by saving a session', async () => {
    const routine = makeRoutine();
    const { result } = renderHook(() => useWorkout(routine));

    expect(result.current.playing).toBe(false);
    expect(result.current.finished).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.secondsLeft).toBe(2);

    act(() => result.current.togglePlay());
    expect(result.current.playing).toBe(true);

    // Run full routine (9 seconds total).
    await act(async () => {
      jest.advanceTimersByTime(9_000);
    });

    // End state.
    expect(result.current.finished).toBe(true);
    expect(result.current.playing).toBe(false);
    expect(result.current.elapsed).toBe(9);
    expect(haptics.hapticSuccess).toHaveBeenCalledTimes(1);
    expect(storage.saveSession).toHaveBeenCalledTimes(1);

    const saved = storage.saveSession.mock.calls[0]?.[0];
    expect(saved).toEqual(
      expect.objectContaining({
        routineId: routine.id,
        routineName: routine.name,
        routineLevel: routine.level,
        durationSeconds: 9,
      })
    );
  });

  it('fires countdown haptics on the last 3 seconds of a work step', async () => {
    const routine = makeRoutine();
    const { result } = renderHook(() => useWorkout(routine));

    act(() => result.current.togglePlay());

    // First, consume prep step (2s), then 4 ticks into work (5s -> 1s).
    await act(async () => {
      jest.advanceTimersByTime(6_000);
    });

    // Work step lasts 5s; countdown should trigger at 3,2,1 => 3 calls.
    expect(haptics.hapticCountdown).toHaveBeenCalledTimes(3);
  });
});

