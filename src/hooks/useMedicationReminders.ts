import { useEffect, useCallback, useState } from 'react';
import { Medication } from '@/types/health';
import { format } from 'date-fns';

export function useMedicationReminders(medications: Medication[]) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    return permission === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permissionStatus !== 'granted') return;

    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'medication-reminder',
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }, [permissionStatus]);

  // Check for medication times and send reminders
  useEffect(() => {
    if (permissionStatus !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      
      medications.forEach(medication => {
        if (medication.reminderEnabled && medication.times.includes(currentTime)) {
          sendNotification(
            '💊 Medication Reminder',
            `Time to take ${medication.name} (${medication.dosage})`,
          );
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    
    // Also check immediately on mount
    checkReminders();

    return () => clearInterval(interval);
  }, [medications, permissionStatus, sendNotification]);

  return {
    permissionStatus,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window,
  };
}
