import { motion } from 'framer-motion';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Zap, Pill, Calendar, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SeizureLog, Medication, Appointment } from '@/types/health';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  seizures: SeizureLog[];
  medications: Medication[];
  appointments: Appointment[];
  onTabChange: (tab: string) => void;
}

export function DashboardView({ seizures, medications, appointments, onTabChange }: DashboardViewProps) {
  const today = new Date();
  const last30Days = seizures.filter(s => 
    new Date(s.date) >= subDays(today, 30)
  );
  const last7Days = seizures.filter(s => 
    new Date(s.date) >= subDays(today, 7)
  );
  const previousWeek = seizures.filter(s => {
    const date = new Date(s.date);
    return date >= subDays(today, 14) && date < subDays(today, 7);
  });

  const seizureTrend = last7Days.length - previousWeek.length;
  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Calendar heat map data
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const seizuresByDay = seizures.reduce((acc, s) => {
    const day = s.date;
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h2 className="font-display text-2xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Last 7 Days</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{last7Days.length}</p>
                <p className="text-xs text-muted-foreground mt-1">seizures</p>
              </div>
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                seizureTrend <= 0 ? 'bg-success/10' : 'bg-destructive/10'
              )}>
                <Zap className={cn(
                  'w-6 h-6',
                  seizureTrend <= 0 ? 'text-success' : 'text-destructive'
                )} />
              </div>
            </div>
            {seizureTrend !== 0 && (
              <div className={cn(
                'flex items-center gap-1 mt-3 text-xs font-medium',
                seizureTrend < 0 ? 'text-success' : 'text-destructive'
              )}>
                {seizureTrend < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                <span>{Math.abs(seizureTrend)} {seizureTrend < 0 ? 'fewer' : 'more'} than last week</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Monthly Total</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{last30Days.length}</p>
                <p className="text-xs text-muted-foreground mt-1">seizures this month</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Medications</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{medications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">active medications</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Upcoming</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{upcomingAppointments.length}</p>
                <p className="text-xs text-muted-foreground mt-1">appointments</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seizure Calendar */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Seizure Activity</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onTabChange('seizures')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{format(today, 'MMMM yyyy')}</p>
              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
                    {day}
                  </div>
                ))}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {daysInMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const count = seizuresByDay[dateStr] || 0;
                  const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                  
                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        'aspect-square rounded-lg flex items-center justify-center text-sm transition-colors',
                        isToday && 'ring-2 ring-primary',
                        count === 0 && 'bg-secondary text-secondary-foreground',
                        count === 1 && 'bg-warning/20 text-warning',
                        count === 2 && 'bg-warning/40 text-warning',
                        count >= 3 && 'bg-destructive/30 text-destructive'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-secondary" />
                  <span>None</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning/40" />
                  <span>1-2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-destructive/30" />
                  <span>3+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Upcoming */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Actions */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full btn-gradient justify-start gap-3" 
                onClick={() => onTabChange('seizures')}
              >
                <Zap className="w-4 h-4" />
                Log Seizure
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => onTabChange('medications')}
              >
                <Pill className="w-4 h-4" />
                Add Medication
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => onTabChange('appointments')}
              >
                <Calendar className="w-4 h-4" />
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Upcoming</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onTabChange('appointments')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{apt.title}</p>
                        <p className="text-xs text-muted-foreground">{apt.doctor}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(apt.date), 'MMM d')} at {apt.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Seizures */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Recent Seizures</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onTabChange('seizures')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {seizures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No seizures logged yet</p>
                <p className="text-sm mt-1">Start tracking to see patterns over time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {seizures.slice(0, 5).map((seizure) => (
                  <div 
                    key={seizure.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        seizure.severity >= 4 ? 'bg-destructive/10' : 'bg-warning/10'
                      )}>
                        <Zap className={cn(
                          'w-5 h-5',
                          seizure.severity >= 4 ? 'text-destructive' : 'text-warning'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground capitalize">
                          {seizure.type.replace('-', ' ')} Seizure
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(seizure.date), 'MMM d, yyyy')} at {seizure.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {seizure.duration < 60 
                          ? `${seizure.duration}s` 
                          : `${Math.floor(seizure.duration / 60)}m ${seizure.duration % 60}s`
                        }
                      </p>
                      <div className="flex gap-0.5 mt-1 justify-end">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              'w-1.5 h-4 rounded-full',
                              level <= seizure.severity 
                                ? level >= 4 ? 'bg-destructive' : 'bg-warning'
                                : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
