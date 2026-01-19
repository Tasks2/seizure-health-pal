import { LayoutDashboard, Zap, Pill, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'seizures', label: 'Seizure Log', icon: Zap },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export function NavigationMenu({ activeTab, onTabChange }: NavigationMenuProps) {
  return (
    <nav className="flex flex-col gap-2 pt-8">
      <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Navigation</h2>
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? 'default' : 'ghost'}
          className={cn(
            'w-full justify-start gap-3',
            activeTab === item.id && 'btn-gradient'
          )}
          onClick={() => onTabChange(item.id)}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </Button>
      ))}
    </nav>
  );
}
