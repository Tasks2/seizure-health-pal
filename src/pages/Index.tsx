import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SeizureLogView } from '@/components/seizures/SeizureLogView';
import { MedicationView } from '@/components/medications/MedicationView';
import { AppointmentView } from '@/components/appointments/AppointmentView';
import { ReportView } from '@/components/reports/ReportView';
import { EmergencyContactView } from '@/components/emergency/EmergencyContactView';
import { SymptomJournalView } from '@/components/journal/SymptomJournalView';
import { useHealthData } from '@/hooks/useHealthData';
import { useMedicationReminders } from '@/hooks/useMedicationReminders';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    seizures,
    medications,
    appointments,
    reminders,
    emergencyContacts,
    symptomJournal,
    isLoaded,
    addSeizure,
    updateSeizure,
    deleteSeizure,
    addMedication,
    updateMedication,
    deleteMedication,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markMedicationTaken,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    addSymptomEntry,
    updateSymptomEntry,
    deleteSymptomEntry,
  } = useHealthData();

  // Initialize medication reminders
  useMedicationReminders(medications);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-full bg-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            seizures={seizures}
            medications={medications}
            appointments={appointments}
            onTabChange={setActiveTab}
          />
        );
      case 'seizures':
        return (
          <SeizureLogView
            seizures={seizures}
            onAdd={addSeizure}
            onUpdate={updateSeizure}
            onDelete={deleteSeizure}
          />
        );
      case 'medications':
        return (
          <MedicationView
            medications={medications}
            reminders={reminders}
            onAdd={addMedication}
            onUpdate={updateMedication}
            onDelete={deleteMedication}
            onMarkTaken={markMedicationTaken}
          />
        );
      case 'journal':
        return (
          <SymptomJournalView
            entries={symptomJournal}
            onAdd={addSymptomEntry}
            onUpdate={updateSymptomEntry}
            onDelete={deleteSymptomEntry}
          />
        );
      case 'appointments':
        return (
          <AppointmentView
            appointments={appointments}
            onAdd={addAppointment}
            onUpdate={updateAppointment}
            onDelete={deleteAppointment}
          />
        );
      case 'emergency':
        return (
          <EmergencyContactView
            contacts={emergencyContacts}
            onAdd={addEmergencyContact}
            onUpdate={updateEmergencyContact}
            onDelete={deleteEmergencyContact}
          />
        );
      case 'reports':
        return (
          <ReportView
            seizures={seizures}
            medications={medications}
            appointments={appointments}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
