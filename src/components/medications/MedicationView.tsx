import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pill, Clock, AlertCircle, Trash2, Edit, Check, Bell, BellOff, BellRing } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Medication, MedicationReminder } from '@/types/health';
import { MedicationForm } from './MedicationForm';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMedicationReminders } from '@/hooks/useMedicationReminders';

interface MedicationViewProps {
  medications: Medication[];
  reminders: MedicationReminder[];
  onAdd: (medication: Omit<Medication, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Medication>) => void;
  onDelete: (id: string) => void;
  onMarkTaken: (medicationId: string, date: string, time: string, taken: boolean) => void;
}

export function MedicationView({ 
  medications, 
  reminders, 
  onAdd, 
  onUpdate, 
  onDelete,
  onMarkTaken 
}: MedicationViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const { permissionStatus, requestPermission, isSupported } = useMedicationReminders(medications);

  const today = format(new Date(), 'yyyy-MM-dd');

  const handleSubmit = (data: Omit<Medication, 'id'>) => {
    if (editingMedication) {
      onUpdate(editingMedication.id, data);
    } else {
      onAdd(data);
    }
    setIsDialogOpen(false);
    setEditingMedication(null);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setIsDialogOpen(true);
  };

  const isTimeTaken = (medicationId: string, time: string) => {
    return reminders.some(
      r => r.medicationId === medicationId && r.date === today && r.time === time && r.taken
    );
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

  // Get medications with low pills or upcoming refills
  const lowStockMedications = medications.filter(
    m => m.pillsRemaining !== undefined && m.pillsRemaining <= 7
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Medications</h2>
          <p className="text-muted-foreground">Track your medications and set reminders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingMedication(null);
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </DialogTitle>
            </DialogHeader>
            <MedicationForm
              initialData={editingMedication || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingMedication(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Notification Settings */}
      {isSupported && (
        <motion.div variants={itemVariants}>
          <Card className={cn(
            "card-elevated",
            permissionStatus === 'granted' && "border-success/50 bg-success/5",
            permissionStatus === 'denied' && "border-destructive/50 bg-destructive/5",
            permissionStatus === 'default' && "border-primary/50 bg-primary/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {permissionStatus === 'granted' ? (
                    <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                      <BellRing className="w-5 h-5 text-success" />
                    </div>
                  ) : permissionStatus === 'denied' ? (
                    <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <BellOff className="w-5 h-5 text-destructive" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {permissionStatus === 'granted' 
                        ? 'Reminders Enabled' 
                        : permissionStatus === 'denied' 
                          ? 'Reminders Blocked' 
                          : 'Enable Reminders'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {permissionStatus === 'granted' 
                        ? "You'll receive notifications for medication times" 
                        : permissionStatus === 'denied' 
                          ? 'Please enable notifications in your browser settings' 
                          : 'Get notified when it\'s time to take your medications'}
                    </p>
                  </div>
                </div>
                {permissionStatus === 'default' && (
                  <Button 
                    onClick={requestPermission}
                    className="btn-gradient gap-2 shrink-0"
                  >
                    <Bell className="w-4 h-4" />
                    Enable
                  </Button>
                )}
                {permissionStatus === 'granted' && (
                  <div className="flex items-center gap-2 text-success text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Active
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Low Stock Alerts */}
      {lowStockMedications.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Low Stock Alert</p>
                  <p className="text-sm text-muted-foreground">
                    {lowStockMedications.map(m => m.name).join(', ')} 
                    {lowStockMedications.length === 1 ? ' is' : ' are'} running low. Consider refilling soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Schedule */}
      {medications.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medications.flatMap(med => 
                  med.times.map(time => ({
                    medication: med,
                    time,
                    taken: isTimeTaken(med.id, time)
                  }))
                ).sort((a, b) => a.time.localeCompare(b.time)).map(({ medication, time, taken }) => (
                  <div 
                    key={`${medication.id}-${time}`}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg transition-colors',
                      taken ? 'bg-success/10' : 'bg-secondary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        taken ? 'bg-success/20' : 'bg-primary/10'
                      )}>
                        {taken ? (
                          <Check className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          'font-medium text-sm',
                          taken ? 'line-through text-muted-foreground' : 'text-foreground'
                        )}>
                          {medication.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{medication.dosage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{time}</span>
                      <Button
                        size="sm"
                        variant={taken ? 'outline' : 'default'}
                        className={cn(!taken && 'btn-gradient')}
                        onClick={() => onMarkTaken(medication.id, today, time, !taken)}
                      >
                        {taken ? 'Undo' : 'Take'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Medications List */}
      {medications.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No medications added yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Add your medications to track dosages and get reminders for taking them on time.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2">
          {medications.map((medication) => (
            <motion.div key={medication.id} variants={itemVariants}>
              <Card className="card-interactive h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Pill className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground">
                          {medication.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(medication)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(medication.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Frequency</span>
                      <span className="text-foreground">{medication.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Times</span>
                      <span className="text-foreground">{medication.times.join(', ')}</span>
                    </div>
                    {medication.pillsRemaining !== undefined && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Pills remaining</span>
                        <span className={cn(
                          medication.pillsRemaining <= 7 ? 'text-warning' : 'text-foreground'
                        )}>
                          {medication.pillsRemaining}
                        </span>
                      </div>
                    )}
                    {medication.refillDate && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Refill by</span>
                        <span className="text-foreground">
                          {format(new Date(medication.refillDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  {medication.notes && (
                    <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-3">
                      {medication.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
