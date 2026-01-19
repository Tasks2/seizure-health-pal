import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Medication } from '@/types/health';
import { cn } from '@/lib/utils';

interface MedicationFormProps {
  initialData?: Medication;
  onSubmit: (data: Omit<Medication, 'id'>) => void;
  onCancel: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'Once daily', label: 'Once daily' },
  { value: 'Twice daily', label: 'Twice daily' },
  { value: 'Three times daily', label: 'Three times daily' },
  { value: 'Four times daily', label: 'Four times daily' },
  { value: 'Every other day', label: 'Every other day' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'As needed', label: 'As needed' },
];

export function MedicationForm({ initialData, onSubmit, onCancel }: MedicationFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [dosage, setDosage] = useState(initialData?.dosage || '');
  const [frequency, setFrequency] = useState(initialData?.frequency || 'Once daily');
  const [times, setTimes] = useState<string[]>(initialData?.times || ['08:00']);
  const [refillDate, setRefillDate] = useState<Date | undefined>(
    initialData?.refillDate ? new Date(initialData.refillDate) : undefined
  );
  const [pillsRemaining, setPillsRemaining] = useState(
    initialData?.pillsRemaining?.toString() || ''
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times: times.filter(t => t.trim()),
      refillDate: refillDate ? format(refillDate, 'yyyy-MM-dd') : undefined,
      pillsRemaining: pillsRemaining ? parseInt(pillsRemaining) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const addTime = () => {
    setTimes(prev => [...prev, '12:00']);
  };

  const removeTime = (index: number) => {
    setTimes(prev => prev.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, value: string) => {
    setTimes(prev => prev.map((t, i) => i === index ? value : t));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Medication Name</Label>
        <Input
          id="name"
          placeholder="e.g., Levetiracetam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dosage">Dosage</Label>
        <Input
          id="dosage"
          placeholder="e.g., 500mg"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Frequency</Label>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Reminder Times</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addTime}>
            <Plus className="w-4 h-4 mr-1" />
            Add Time
          </Button>
        </div>
        <div className="space-y-2">
          {times.map((time, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="time"
                value={time}
                onChange={(e) => updateTime(index, e.target.value)}
                className="flex-1"
              />
              {times.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTime(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pills">Pills Remaining</Label>
          <Input
            id="pills"
            type="number"
            min="0"
            placeholder="e.g., 30"
            value={pillsRemaining}
            onChange={(e) => setPillsRemaining(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Refill Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !refillDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {refillDate ? format(refillDate, 'PPP') : 'Optional'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={refillDate}
                onSelect={setRefillDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any special instructions or notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 btn-gradient">
          {initialData ? 'Update' : 'Add Medication'}
        </Button>
      </div>
    </form>
  );
}
