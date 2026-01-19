import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { SeizureLog, SEIZURE_TYPES, COMMON_TRIGGERS } from '@/types/health';
import { cn } from '@/lib/utils';

interface SeizureFormProps {
  initialData?: SeizureLog;
  onSubmit: (data: Omit<SeizureLog, 'id'>) => void;
  onCancel: () => void;
}

export function SeizureForm({ initialData, onSubmit, onCancel }: SeizureFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.date) : new Date()
  );
  const [time, setTime] = useState(initialData?.time || format(new Date(), 'HH:mm'));
  const [type, setType] = useState<SeizureLog['type']>(initialData?.type || 'tonic-clonic');
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '');
  const [severity, setSeverity] = useState<number>(initialData?.severity || 3);
  const [triggers, setTriggers] = useState<string[]>(initialData?.triggers || []);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onSubmit({
      date: format(date, 'yyyy-MM-dd'),
      time,
      type,
      duration: parseInt(duration) || 0,
      severity: severity as 1 | 2 | 3 | 4 | 5,
      triggers: triggers.length > 0 ? triggers : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const toggleTrigger = (trigger: string) => {
    setTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Seizure Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as SeizureLog['type'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEIZURE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <div>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            min="0"
            placeholder="e.g., 60"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Severity (1-5)</Label>
          <div className="flex gap-2 pt-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  severity >= level
                    ? level >= 4 
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-warning text-warning-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Possible Triggers</Label>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_TRIGGERS.map((trigger) => (
            <div key={trigger} className="flex items-center space-x-2">
              <Checkbox
                id={trigger}
                checked={triggers.includes(trigger)}
                onCheckedChange={() => toggleTrigger(trigger)}
              />
              <label
                htmlFor={trigger}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {trigger}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional details about this seizure..."
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
          {initialData ? 'Update' : 'Log Seizure'}
        </Button>
      </div>
    </form>
  );
}
