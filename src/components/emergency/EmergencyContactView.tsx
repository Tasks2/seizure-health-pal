import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, Mail, Star, Bell, Trash2, Edit, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmergencyContact } from '@/types/health';
import { EmergencyContactForm } from './EmergencyContactForm';
import { cn } from '@/lib/utils';

interface EmergencyContactViewProps {
  contacts: EmergencyContact[];
  onAdd: (contact: Omit<EmergencyContact, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<EmergencyContact>) => void;
  onDelete: (id: string) => void;
}

export function EmergencyContactView({ contacts, onAdd, onUpdate, onDelete }: EmergencyContactViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  const handleSubmit = (data: Omit<EmergencyContact, 'id'>) => {
    if (editingContact) {
      onUpdate(editingContact.id, data);
    } else {
      onAdd(data);
    }
    setIsDialogOpen(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
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

  const primaryContacts = contacts.filter(c => c.isPrimary);
  const otherContacts = contacts.filter(c => !c.isPrimary);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Emergency Contacts</h2>
          <p className="text-muted-foreground">Quick access to important contacts during emergencies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingContact(null);
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
              </DialogTitle>
            </DialogHeader>
            <EmergencyContactForm
              initialData={editingContact || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingContact(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {contacts.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No emergency contacts added
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Add emergency contacts for quick access during seizure events.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Primary Contacts */}
          {primaryContacts.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="card-elevated border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    Primary Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {primaryContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={handleEdit}
                      onDelete={onDelete}
                      onCall={handleCall}
                      onEmail={handleEmail}
                    />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Other Contacts */}
          {otherContacts.length > 0 && (
            <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2">
              {otherContacts.map((contact) => (
                <motion.div key={contact.id} variants={itemVariants}>
                  <Card className="card-interactive h-full">
                    <CardContent className="p-4">
                      <ContactCard
                        contact={contact}
                        onEdit={handleEdit}
                        onDelete={onDelete}
                        onCall={handleCall}
                        onEmail={handleEmail}
                        compact
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

interface ContactCardProps {
  contact: EmergencyContact;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (id: string) => void;
  onCall: (phone: string) => void;
  onEmail: (email: string) => void;
  compact?: boolean;
}

function ContactCard({ contact, onEdit, onDelete, onCall, onEmail, compact }: ContactCardProps) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/30',
      compact && 'p-0 bg-transparent'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-foreground truncate">{contact.name}</h4>
          {contact.notifyOnSevereSeizure && (
            <Bell className="w-4 h-4 text-warning shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
        <p className="text-sm text-muted-foreground">{contact.phone}</p>
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          className="btn-gradient h-10 w-10"
          onClick={() => onCall(contact.phone)}
        >
          <Phone className="w-4 h-4" />
        </Button>
        {contact.email && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEmail(contact.email!)}
          >
            <Mail className="w-4 h-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(contact)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(contact.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
