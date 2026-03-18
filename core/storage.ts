import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from './domain/routine';

const HISTORY_KEY = '@hiit_history';

export async function saveSession(session: Session) {
  try {
    const existing = await getSessions();
    const updated = [session, ...existing].slice(0, 50); // max 50 sessions
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving session:', e);
  }
}

export async function getSessions() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Error reading sessions:', e);
    return [];
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.warn('Error clearing history:', e);
  }
}
