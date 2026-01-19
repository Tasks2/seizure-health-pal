import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Appointment } from '@/types/health';
import { cn } from '@/lib/utils';

interface AppointmentFormProps {
  initialData?: Appointment;
  onSubmit: (data: Omit<Appointment, 'id'>) => void;
  onCancel: () => void;
}

export function AppointmentForm({ initialData, onSubmit, onCancel }: AppointmentFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [doctor, setDoctor] = useState(initialData?.doctor || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [date, setDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.date) : undefined
  );
  const [time, setTime] = useState(initialData?.time || '09:00');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onSubmit({
      title: title.trim(),
      doctor: doctor.trim(),
      location: location.trim() || undefined,
      date: format(date, 'yyyy-MM-dd'),
      time,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Appointment Title</Label>
        <Input
          id="title"
          placeholder="e.g., Follow-up Visit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="doctor">Doctor / Provider</Label>
        <Input
          id="doctor"
          placeholder="e.g., Dr. Smith - Neurology"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          placeholder="e.g., City Medical Center"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
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
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Questions to ask, things to bring, etc..."
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
          {initialData ? 'Update' : 'Schedule'}
        </Button>
      </div>
    </form>
  );
}
