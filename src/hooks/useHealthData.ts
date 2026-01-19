import { useState, useEffect } from 'react';
import { SeizureLog, Medication, Appointment, MedicationReminder } from '@/types/health';

const STORAGE_KEYS = {
  seizures: 'health_seizures',
  medications: 'health_medications',
  appointments: 'health_appointments',
  reminders: 'health_reminders',
};

export function useHealthData() {
  const [seizures, setSeizures] = useState<SeizureLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedSeizures = localStorage.getItem(STORAGE_KEYS.seizures);
    const loadedMedications = localStorage.getItem(STORAGE_KEYS.medications);
    const loadedAppointments = localStorage.getItem(STORAGE_KEYS.appointments);
    const loadedReminders = localStorage.getItem(STORAGE_KEYS.reminders);

    if (loadedSeizures) setSeizures(JSON.parse(loadedSeizures));
    if (loadedMedications) setMedications(JSON.parse(loadedMedications));
    if (loadedAppointments) setAppointments(JSON.parse(loadedAppointments));
    if (loadedReminders) setReminders(JSON.parse(loadedReminders));
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.seizures, JSON.stringify(seizures));
    }
  }, [seizures, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.medications, JSON.stringify(medications));
    }
  }, [medications, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
    }
  }, [appointments, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(reminders));
    }
  }, [reminders, isLoaded]);

  const addSeizure = (seizure: Omit<SeizureLog, 'id'>) => {
    const newSeizure = { ...seizure, id: crypto.randomUUID() };
    setSeizures(prev => [newSeizure, ...prev]);
    return newSeizure;
  };

  const updateSeizure = (id: string, updates: Partial<SeizureLog>) => {
    setSeizures(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSeizure = (id: string) => {
    setSeizures(prev => prev.filter(s => s.id !== id));
  };

  const addMedication = (medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: crypto.randomUUID() };
    setMedications(prev => [...prev, newMedication]);
    return newMedication;
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = { ...appointment, id: crypto.randomUUID() };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const markMedicationTaken = (medicationId: string, date: string, time: string, taken: boolean) => {
    const existingReminder = reminders.find(
      r => r.medicationId === medicationId && r.date === date && r.time === time
    );

    if (existingReminder) {
      setReminders(prev => prev.map(r => 
        r.id === existingReminder.id ? { ...r, taken } : r
      ));
    } else {
      const newReminder: MedicationReminder = {
        id: crypto.randomUUID(),
        medicationId,
        date,
        time,
        taken,
      };
      setReminders(prev => [...prev, newReminder]);
    }
  };

  return {
    seizures,
    medications,
    appointments,
    reminders,
    isLoaded,
    addSeizure,
    updateSeizure,
    deleteSeizure,
    addMedication,
    updateMedication,
    deleteMedication,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markMedicationTaken,
  };
}
