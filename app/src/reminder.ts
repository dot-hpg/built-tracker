import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const KEY = 'built-tracker-reminder';
export const REMINDER_HOUR = 21;

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function reminderOn(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(KEY)) === 'on'; } catch { return false; }
}

// A local daily nudge to keep the streak alive. Nothing leaves the phone.
export async function setReminder(on: boolean): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (on) {
    const { granted } = await Notifications.requestPermissionsAsync();
    if (!granted) { await AsyncStorage.setItem(KEY, 'off'); return false; }
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Keep the streak going', body: "Have you built something today? Push a commit and it'll show up in your tracker." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: REMINDER_HOUR, minute: 0 },
    });
  }
  await AsyncStorage.setItem(KEY, on ? 'on' : 'off');
  return on;
}
