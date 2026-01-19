export interface SeizureLog {
  id: string;
  date: string;
  time: string;
  type: 'tonic-clonic' | 'absence' | 'focal' | 'myoclonic' | 'atonic' | 'other';
  duration: number; // in seconds
  triggers?: string[];
  notes?: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  refillDate?: string;
  pillsRemaining?: number;
  notes?: string;
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  location?: string;
  date: string;
  time: string;
  notes?: string;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  time: string;
  taken: boolean;
  date: string;
}

export type SeizureType = SeizureLog['type'];

export const SEIZURE_TYPES: { value: SeizureType; label: string; description: string }[] = [
  { value: 'tonic-clonic', label: 'Tonic-Clonic', description: 'Full body convulsions' },
  { value: 'absence', label: 'Absence', description: 'Brief loss of awareness' },
  { value: 'focal', label: 'Focal', description: 'Affects one area of the brain' },
  { value: 'myoclonic', label: 'Myoclonic', description: 'Quick jerking movements' },
  { value: 'atonic', label: 'Atonic', description: 'Sudden loss of muscle tone' },
  { value: 'other', label: 'Other', description: 'Other type of seizure' },
];

export const COMMON_TRIGGERS = [
  'Stress',
  'Lack of sleep',
  'Missed medication',
  'Alcohol',
  'Flashing lights',
  'Illness/Fever',
  'Hormonal changes',
  'Skipped meals',
  'Exercise',
  'Unknown',
];
