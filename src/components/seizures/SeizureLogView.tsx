import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Zap, Trash2, Edit, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SeizureLog, SEIZURE_TYPES, COMMON_TRIGGERS } from '@/types/health';
import { SeizureForm } from './SeizureForm';
import { cn } from '@/lib/utils';

interface SeizureLogViewProps {
  seizures: SeizureLog[];
  onAdd: (seizure: Omit<SeizureLog, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<SeizureLog>) => void;
  onDelete: (id: string) => void;
}

export function SeizureLogView({ seizures, onAdd, onUpdate, onDelete }: SeizureLogViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeizure, setEditingSeizure] = useState<SeizureLog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSeizures = seizures.filter(s => 
    s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.triggers?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = (data: Omit<SeizureLog, 'id'>) => {
    if (editingSeizure) {
      onUpdate(editingSeizure.id, data);
    } else {
      onAdd(data);
    }
    setIsDialogOpen(false);
    setEditingSeizure(null);
  };

  const handleEdit = (seizure: SeizureLog) => {
    setEditingSeizure(seizure);
    setIsDialogOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Seizure Log</h2>
          <p className="text-muted-foreground">Track and monitor your seizures</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingSeizure(null);
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              Log Seizure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingSeizure ? 'Edit Seizure' : 'Log New Seizure'}
              </DialogTitle>
            </DialogHeader>
            <SeizureForm
              initialData={editingSeizure || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingSeizure(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by type, trigger, or notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {filteredSeizures.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {seizures.length === 0 ? 'No seizures logged yet' : 'No matching seizures'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {seizures.length === 0 
                  ? 'Start tracking your seizures to identify patterns and share data with your healthcare provider.'
                  : 'Try adjusting your search terms.'
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {filteredSeizures.map((seizure) => (
            <motion.div key={seizure.id} variants={itemVariants}>
              <Card className="card-interactive">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                      seizure.severity >= 4 ? 'bg-destructive/10' : 'bg-warning/10'
                    )}>
                      <Zap className={cn(
                        'w-6 h-6',
                        seizure.severity >= 4 ? 'text-destructive' : 'text-warning'
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <h3 className="font-display font-semibold text-foreground capitalize">
                          {SEIZURE_TYPES.find(t => t.value === seizure.type)?.label || seizure.type}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(seizure.date), 'EEEE, MMMM d, yyyy')} at {seizure.time}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          Duration: {seizure.duration < 60 
                            ? `${seizure.duration} seconds` 
                            : `${Math.floor(seizure.duration / 60)}m ${seizure.duration % 60}s`
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          Severity:
                          <div className="flex gap-0.5 ml-1">
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
                        </span>
                      </div>

                      {seizure.triggers && seizure.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {seizure.triggers.map((trigger) => (
                            <span 
                              key={trigger}
                              className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                            >
                              {trigger}
                            </span>
                          ))}
                        </div>
                      )}

                      {seizure.notes && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {seizure.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(seizure)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(seizure.id)}
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
