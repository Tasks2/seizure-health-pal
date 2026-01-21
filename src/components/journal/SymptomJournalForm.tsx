import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { SymptomJournalEntry } from '@/types/health';
import { format } from 'date-fns';
import { Smile, Moon, Zap, Activity } from 'lucide-react';

const journalSchema = z.object({
  date: z.string(),
  mood: z.number().min(1).max(5),
  sleepQuality: z.number().min(1).max(5),
  sleepHours: z.number().min(0).max(24),
  stressLevel: z.number().min(1).max(5),
  energyLevel: z.number().min(1).max(5),
  exercised: z.boolean(),
  alcoholConsumed: z.boolean(),
  missedMedication: z.boolean(),
  notes: z.string().max(500).optional(),
});

type JournalFormData = z.infer<typeof journalSchema>;

interface SymptomJournalFormProps {
  initialData?: SymptomJournalEntry;
  onSubmit: (data: Omit<SymptomJournalEntry, 'id'>) => void;
  onCancel: () => void;
}

const MOOD_LABELS = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];
const SLEEP_LABELS = ['Poor', 'Fair', 'Okay', 'Good', 'Excellent'];
const STRESS_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const ENERGY_LABELS = ['Exhausted', 'Low', 'Moderate', 'Good', 'Energized'];

export function SymptomJournalForm({ initialData, onSubmit, onCancel }: SymptomJournalFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
      mood: initialData?.mood || 3,
      sleepQuality: initialData?.sleepQuality || 3,
      sleepHours: initialData?.sleepHours || 7,
      stressLevel: initialData?.stressLevel || 3,
      energyLevel: initialData?.energyLevel || 3,
      exercised: initialData?.exercised || false,
      alcoholConsumed: initialData?.alcoholConsumed || false,
      missedMedication: initialData?.missedMedication || false,
      notes: initialData?.notes || '',
    },
  });

  const mood = watch('mood');
  const sleepQuality = watch('sleepQuality');
  const sleepHours = watch('sleepHours');
  const stressLevel = watch('stressLevel');
  const energyLevel = watch('energyLevel');
  const exercised = watch('exercised');
  const alcoholConsumed = watch('alcoholConsumed');
  const missedMedication = watch('missedMedication');

  const handleFormSubmit = (data: JournalFormData) => {
    onSubmit(data as Omit<SymptomJournalEntry, 'id'>);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Mood */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-primary" />
          <Label>Mood</Label>
          <span className="ml-auto text-sm font-medium text-primary">{MOOD_LABELS[mood - 1]}</span>
        </div>
        <Slider
          value={[mood]}
          onValueChange={([value]) => setValue('mood', value as 1 | 2 | 3 | 4 | 5)}
          min={1}
          max={5}
          step={1}
          className="py-2"
        />
      </div>

      {/* Sleep Quality */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          <Label>Sleep Quality</Label>
          <span className="ml-auto text-sm font-medium text-primary">{SLEEP_LABELS[sleepQuality - 1]}</span>
        </div>
        <Slider
          value={[sleepQuality]}
          onValueChange={([value]) => setValue('sleepQuality', value as 1 | 2 | 3 | 4 | 5)}
          min={1}
          max={5}
          step={1}
          className="py-2"
        />
      </div>

      {/* Sleep Hours */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Hours of Sleep</Label>
          <span className="ml-auto text-sm font-medium text-primary">{sleepHours} hours</span>
        </div>
        <Slider
          value={[sleepHours]}
          onValueChange={([value]) => setValue('sleepHours', value)}
          min={0}
          max={12}
          step={0.5}
          className="py-2"
        />
      </div>

      {/* Stress Level */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" />
          <Label>Stress Level</Label>
          <span className="ml-auto text-sm font-medium text-warning">{STRESS_LABELS[stressLevel - 1]}</span>
        </div>
        <Slider
          value={[stressLevel]}
          onValueChange={([value]) => setValue('stressLevel', value as 1 | 2 | 3 | 4 | 5)}
          min={1}
          max={5}
          step={1}
          className="py-2"
        />
      </div>

      {/* Energy Level */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-success" />
          <Label>Energy Level</Label>
          <span className="ml-auto text-sm font-medium text-success">{ENERGY_LABELS[energyLevel - 1]}</span>
        </div>
        <Slider
          value={[energyLevel]}
          onValueChange={([value]) => setValue('energyLevel', value as 1 | 2 | 3 | 4 | 5)}
          min={1}
          max={5}
          step={1}
          className="py-2"
        />
      </div>

      {/* Boolean Toggles */}
      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="exercised">Exercised Today</Label>
          <Switch
            id="exercised"
            checked={exercised}
            onCheckedChange={(checked) => setValue('exercised', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="alcohol">Consumed Alcohol</Label>
          <Switch
            id="alcohol"
            checked={alcoholConsumed}
            onCheckedChange={(checked) => setValue('alcoholConsumed', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="missedMed">Missed Medication</Label>
            {missedMedication && (
              <p className="text-xs text-destructive">This is a seizure trigger</p>
            )}
          </div>
          <Switch
            id="missedMed"
            checked={missedMedication}
            onCheckedChange={(checked) => setValue('missedMedication', checked)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="How did you feel today? Any symptoms or observations..."
          rows={3}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 btn-gradient">
          {initialData ? 'Save Changes' : 'Log Entry'}
        </Button>
      </div>
    </form>
  );
}
