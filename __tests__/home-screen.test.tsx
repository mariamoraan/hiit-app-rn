import { fireEvent, render, waitFor, within } from '@testing-library/react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { ROUTINES } from '@/core/data';
import { Level, type Session } from '@/core/domain/routine';
import { getSessions } from '@/core/storage';
import { router } from 'expo-router';
import HomeScreen from '../app/(tabs)/index';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: any) => {
    const { useEffect } = require('react');
    useEffect(cb, []);
  },
}));

jest.mock('@/core/storage', () => ({
  getSessions: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/components/routine-card', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  return {
    __esModule: true,
    default: ({ routine, onPress }: any) => (
      <TouchableOpacity testID={`routine-${routine.id}`} onPress={onPress}>
        <Text>{routine.name}</Text>
      </TouchableOpacity>
    ),
  };
});

const getSessionsMock = getSessions as jest.MockedFunction<typeof getSessions>;
const routerPushMock = (router as any).push as jest.Mock;

function makeSession(partial: Partial<Session> & Pick<Session, 'routineId' | 'durationSeconds'>): Session {
  return {
    id: 's1',
    routineName: partial.routineName ?? ROUTINES.find(r => r.id === partial.routineId)?.name ?? 'Unknown',
    routineLevel:
      partial.routineLevel ?? (ROUTINES.find(r => r.id === partial.routineId)?.level as Level) ?? Level.beginner,
    completedAt: partial.completedAt ?? new Date('2026-01-01T12:00:00.000Z').toISOString(),
    ...partial,
  };
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSessionsMock.mockResolvedValue([]);
  });

  it('Should not display stats or badge when there are no sesiones', async () => {
    const { queryByText, getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getSessionsMock).toHaveBeenCalled());

    expect(queryByText('sesiones')).toBeNull();
    expect(queryByText('minutos')).toBeNull();
    expect(queryByText('último')).toBeNull();

    expect(getByText('ELIGE TU ENTRENO')).toBeTruthy();
  });

  it('Should display badge/stats width stored sessions', async () => {
    const sessions: Session[] = [
      makeSession({
        id: 's1',
        routineId: 'intermediate',
        routineName: 'Ignición',
        routineLevel: Level.intermediate,
        durationSeconds: 125, // ~2 min
      }),
    ];
    getSessionsMock.mockResolvedValueOnce(sessions);

    const { getByText, getAllByText } = render(<HomeScreen />);

    await waitFor(() => expect(getSessionsMock).toHaveBeenCalled());

    expect(getByText('sesiones')).toBeTruthy();
    expect(getByText('minutos')).toBeTruthy();
    expect(getByText('último')).toBeTruthy();


    expect(getByText('2')).toBeTruthy();

    expect(getAllByText('Ignición').length).toBeGreaterThanOrEqual(2);
  });

  it('Should allow to navigate to workout page and history page', async () => {
    getSessionsMock.mockResolvedValueOnce([]);

    const { getByTestId, UNSAFE_getAllByType } = render(<HomeScreen />);

    await waitFor(() => expect(getSessionsMock).toHaveBeenCalled());

    const firstRoutine = ROUTINES[0];
    fireEvent.press(getByTestId(`routine-${firstRoutine.id}`));

    expect(routerPushMock).toHaveBeenCalledWith({
      pathname: '/workout-screen',
      params: { routineId: firstRoutine.id },
    });

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    const historyTouchable = touchables.find(t => within(t).queryByText('Historial'));
    if (!historyTouchable) throw new Error('History button not found');

    fireEvent.press(historyTouchable);
    expect(routerPushMock).toHaveBeenCalledWith('/(tabs)/history-screen');
  });
});

