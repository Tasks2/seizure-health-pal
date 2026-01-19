import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isFuture, isPast, isToday } from 'date-fns';
import { Plus, Calendar, MapPin, Clock, Trash2, Edit, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Appointment } from '@/types/health';
import { AppointmentForm } from './AppointmentForm';
import { cn } from '@/lib/utils';

interface AppointmentViewProps {
  appointments: Appointment[];
  onAdd: (appointment: Omit<Appointment, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Appointment>) => void;
  onDelete: (id: string) => void;
}

export function AppointmentView({ appointments, onAdd, onUpdate, onDelete }: AppointmentViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleSubmit = (data: Omit<Appointment, 'id'>) => {
    if (editingAppointment) {
      onUpdate(editingAppointment.id, data);
    } else {
      onAdd(data);
    }
    setIsDialogOpen(false);
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  };

  const upcomingAppointments = appointments
    .filter(a => isFuture(new Date(a.date)) || isToday(new Date(a.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter(a => isPast(new Date(a.date)) && !isToday(new Date(a.date)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: Appointment; isPast?: boolean }) => (
    <Card className={cn('card-interactive', isPast && 'opacity-75')}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isToday(new Date(appointment.date)) ? 'bg-accent/10' : 'bg-primary/10'
            )}>
              <Calendar className={cn(
                'w-6 h-6',
                isToday(new Date(appointment.date)) ? 'text-accent' : 'text-primary'
              )} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {appointment.title}
              </h3>
              {isToday(new Date(appointment.date)) && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                  Today
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(appointment)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(appointment.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{appointment.doctor}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')} at {appointment.time}
            </span>
          </div>
          {appointment.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{appointment.location}</span>
            </div>
          )}
        </div>

        {appointment.notes && (
          <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-3">
            {appointment.notes}
          </p>
        )}
      </CardContent>
    </Card>
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
          <h2 className="font-display text-2xl font-bold text-foreground">Appointments</h2>
          <p className="text-muted-foreground">Manage your neurologist appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingAppointment(null);
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
              </DialogTitle>
            </DialogHeader>
            <AppointmentForm
              initialData={editingAppointment || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingAppointment(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {appointments.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No appointments scheduled
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Schedule your neurologist appointments to keep track of your healthcare visits.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingAppointments.length === 0 ? (
                <Card className="card-elevated">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No upcoming appointments
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastAppointments.length === 0 ? (
                <Card className="card-elevated">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No past appointments
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} isPast />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </motion.div>
  );
}
