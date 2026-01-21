import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Smile, Moon, Zap, Activity, Trash2, Edit, Dumbbell, Wine, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SymptomJournalEntry } from '@/types/health';
import { SymptomJournalForm } from './SymptomJournalForm';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface SymptomJournalViewProps {
  entries: SymptomJournalEntry[];
  onAdd: (entry: Omit<SymptomJournalEntry, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<SymptomJournalEntry>) => void;
  onDelete: (id: string) => void;
}

const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😊'];
const MOOD_COLORS = ['text-destructive', 'text-warning', 'text-muted-foreground', 'text-primary', 'text-success'];

export function SymptomJournalView({ entries, onAdd, onUpdate, onDelete }: SymptomJournalViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SymptomJournalEntry | null>(null);

  const handleSubmit = (data: Omit<SymptomJournalEntry, 'id'>) => {
    if (editingEntry) {
      onUpdate(editingEntry.id, data);
    } else {
      onAdd(data);
    }
    setIsDialogOpen(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry: SymptomJournalEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const todayEntry = entries.find(e => isToday(parseISO(e.date)));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Symptom Journal</h2>
          <p className="text-muted-foreground">Track daily factors that may affect seizures</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingEntry(null);
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              {todayEntry ? 'Add Entry' : "Log Today's Entry"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
              </DialogTitle>
            </DialogHeader>
            <SymptomJournalForm
              initialData={editingEntry || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingEntry(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Today's Summary */}
      {todayEntry && (
        <motion.div variants={itemVariants}>
          <Card className="card-elevated border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard
                  icon={Smile}
                  label="Mood"
                  value={todayEntry.mood}
                  emoji={MOOD_EMOJIS[todayEntry.mood - 1]}
                  colorClass={MOOD_COLORS[todayEntry.mood - 1]}
                />
                <MetricCard
                  icon={Moon}
                  label="Sleep"
                  value={todayEntry.sleepHours}
                  suffix="hrs"
                  colorClass="text-primary"
                />
                <MetricCard
                  icon={Zap}
                  label="Stress"
                  value={todayEntry.stressLevel}
                  colorClass={todayEntry.stressLevel >= 4 ? 'text-warning' : 'text-muted-foreground'}
                />
                <MetricCard
                  icon={Activity}
                  label="Energy"
                  value={todayEntry.energyLevel}
                  colorClass={todayEntry.energyLevel >= 4 ? 'text-success' : 'text-muted-foreground'}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {todayEntry.exercised && (
                  <Badge variant="secondary" className="gap-1">
                    <Dumbbell className="w-3 h-3" /> Exercised
                  </Badge>
                )}
                {todayEntry.alcoholConsumed && (
                  <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning">
                    <Wine className="w-3 h-3" /> Alcohol
                  </Badge>
                )}
                {todayEntry.missedMedication && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" /> Missed Medication
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Journal Entries List */}
      {entries.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No journal entries yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Start tracking daily symptoms, mood, and lifestyle factors to identify seizure patterns.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {entries.map((entry) => (
            <motion.div key={entry.id} variants={itemVariants}>
              <Card className="card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{MOOD_EMOJIS[entry.mood - 1]}</span>
                        <div>
                          <p className="font-semibold text-foreground">{formatDate(entry.date)}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.sleepHours}hrs sleep • Stress {entry.stressLevel}/5
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {entry.exercised && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Dumbbell className="w-3 h-3" /> Exercise
                          </Badge>
                        )}
                        {entry.alcoholConsumed && (
                          <Badge variant="secondary" className="gap-1 text-xs bg-warning/10 text-warning">
                            <Wine className="w-3 h-3" /> Alcohol
                          </Badge>
                        )}
                        {entry.missedMedication && (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle className="w-3 h-3" /> Missed Med
                          </Badge>
                        )}
                      </div>

                      {entry.notes && (
                        <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  suffix?: string;
  emoji?: string;
  colorClass?: string;
}

function MetricCard({ icon: Icon, label, value, suffix, emoji, colorClass }: MetricCardProps) {
  return (
    <div className="text-center p-3 rounded-lg bg-background/50">
      <Icon className={cn('w-5 h-5 mx-auto mb-1', colorClass)} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('font-bold text-lg', colorClass)}>
        {emoji || `${value}${suffix ? ` ${suffix}` : '/5'}`}
      </p>
    </div>
  );
}
