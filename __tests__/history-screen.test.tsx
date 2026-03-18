import { fireEvent, render, waitFor, within } from '@testing-library/react-native';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { Level, type Session } from '@/core/domain/routine';
import { getSessions } from '@/core/storage';

const mockGoBack = jest.fn();
jest.mock('expo-router', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('@/core/storage', () => ({
  getSessions: jest.fn().mockResolvedValue([]),
  // clearHistory no se necesita para estos tests (no está en el render actual)
  clearHistory: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: any) => {
    const { useEffect } = require('react');
    useEffect(cb, []);
  },
}));

const getSessionsMock = getSessions as jest.MockedFunction<typeof getSessions>;
// Importar después de declarar los mocks para evitar que Jest resuelva módulos reales.
const HistoryScreen = require('../app/(tabs)/history-screen').default as typeof import('../app/(tabs)/history-screen').default;

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: unknown | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <Text testID="history-error">{String((this.state.error as any)?.message ?? this.state.error)}</Text>;
    }
    return this.props.children as any;
  }
}

function makeSession(partial: Partial<Session> & Pick<Session, 'routineId' | 'durationSeconds' | 'routineName'>): Session {
  return {
    id: partial.id ?? Math.random().toString(16).slice(2),
    routineId: partial.routineId,
    routineName: partial.routineName,
    routineLevel: partial.routineLevel ?? Level.beginner,
    completedAt: partial.completedAt ?? new Date('2026-01-01T12:00:00.000Z').toISOString(),
    durationSeconds: partial.durationSeconds,
  };
}

describe('HistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGoBack.mockReset();
  });

  it('Should display empty state when no sessions and allow to start a new session going back to home', async () => {
    getSessionsMock.mockResolvedValueOnce([]);

    const { getByText, UNSAFE_getAllByType, queryByTestId } = render(
      <ErrorBoundary>
        <HistoryScreen />
      </ErrorBoundary>
    );

    expect(queryByTestId('history-error')).toBeNull();
    await waitFor(() => expect(getByText('Sin sesiones aún')).toBeTruthy());
    // Si el focus effect se ejecuta, getSessions debe haber sido llamado.
    // (No lo forzamos con mocks; solo lo validamos cuando aplique.)
    expect(getSessionsMock).toHaveBeenCalled();

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    const startNow = touchables.find(t => within(t).queryByText('EMPEZAR AHORA'));
    if (!startNow) throw new Error('CTA button not found');

    fireEvent.press(startNow);
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('Should display sessions list', async () => {
    const expectedSessions: Session[] = [
      makeSession({
        id: 's1',
        routineId: 'beginner',
        routineName: 'Arranque',
        routineLevel: Level.beginner,
        durationSeconds: 120, // 2:00
      }),
      makeSession({
        id: 's2',
        routineId: 'intermediate',
        routineName: 'Ignición',
        routineLevel: Level.intermediate,
        durationSeconds: 65, // 1:05
      }),
    ];

    getSessionsMock.mockResolvedValue(expectedSessions);

    const { getByText, getAllByText, queryByTestId } = render(
      <ErrorBoundary>
        <HistoryScreen />
      </ErrorBoundary>
    );

    expect(queryByTestId('history-error')).toBeNull();

    await waitFor(() => expect(getSessionsMock).toHaveBeenCalled());

    await waitFor(() => expect(getByText('POR RUTINA')).toBeTruthy());

    expect(getByText('SESIONES')).toBeTruthy();

    // TotalMinutes = round(120/60)=2 + round(65/60)=1 => 3 => kcal est = ~24
    expect(getByText('~24')).toBeTruthy();

    expect(getAllByText('Arranque').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Ignición').length).toBeGreaterThanOrEqual(1);

    expect(getByText('2:00')).toBeTruthy();
    expect(getByText('1:05')).toBeTruthy();
  });
});

