import { Level, type Session } from '@/core/domain/routine';
import { clearHistory, getSessions, saveSession } from '@/core/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('storage', () => {
  beforeEach(async () => {
    // The RN async storage mock keeps an in-memory map.
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('Should save session in descendant order', async () => {
    const s1: Session = {
      id: 's1',
      routineId: 'beginner',
      routineName: 'Arranque',
      routineLevel: Level.beginner,
      completedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      durationSeconds: 60,
    };

    const s2: Session = {
      id: 's2',
      routineId: 'intermediate',
      routineName: 'Ignición',
      routineLevel: Level.intermediate,
      completedAt: new Date('2026-01-02T00:00:00.000Z').toISOString(),
      durationSeconds: 120,
    };

    await saveSession(s1);
    await saveSession(s2);

    const sessions = await getSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].id).toBe('s2');
    expect(sessions[1].id).toBe('s1');
  });

  it('Should clear history', async () => {
    const s1: Session = {
      id: 's1',
      routineId: 'beginner',
      routineName: 'Arranque',
      routineLevel: Level.beginner,
      completedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      durationSeconds: 60,
    };

    await saveSession(s1);
    expect((await getSessions()).length).toBe(1);

    await clearHistory();
    expect((await getSessions()).length).toBe(0);
  });
});

