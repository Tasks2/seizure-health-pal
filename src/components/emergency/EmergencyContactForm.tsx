import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmergencyContact, RELATIONSHIP_TYPES } from '@/types/health';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().trim().min(10, 'Valid phone number required').max(20),
  email: z.string().trim().email().optional().or(z.literal('')),
  isPrimary: z.boolean(),
  notifyOnSevereSeizure: z.boolean(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface EmergencyContactFormProps {
  initialData?: EmergencyContact;
  onSubmit: (data: Omit<EmergencyContact, 'id'>) => void;
  onCancel: () => void;
}

export function EmergencyContactForm({ initialData, onSubmit, onCancel }: EmergencyContactFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: initialData?.name || '',
      relationship: initialData?.relationship || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      isPrimary: initialData?.isPrimary || false,
      notifyOnSevereSeizure: initialData?.notifyOnSevereSeizure || false,
    },
  });

  const isPrimary = watch('isPrimary');
  const notifyOnSevere = watch('notifyOnSevereSeizure');

  const handleFormSubmit = (data: ContactFormData) => {
    onSubmit({
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      email: data.email || undefined,
      isPrimary: data.isPrimary,
      notifyOnSevereSeizure: data.notifyOnSevereSeizure,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Doe"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="relationship">Relationship</Label>
        <Select 
          value={watch('relationship')} 
          onValueChange={(value) => setValue('relationship', value)}
        >
          <SelectTrigger className={errors.relationship ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select relationship" />
          </SelectTrigger>
          <SelectContent>
            {RELATIONSHIP_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.relationship && <p className="text-sm text-destructive">{errors.relationship.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="+1 (555) 123-4567"
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john@example.com"
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <Label htmlFor="isPrimary">Primary Contact</Label>
          <p className="text-sm text-muted-foreground">First person to call in emergency</p>
        </div>
        <Switch
          id="isPrimary"
          checked={isPrimary}
          onCheckedChange={(checked) => setValue('isPrimary', checked)}
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <Label htmlFor="notifyOnSevere">Notify on Severe Seizures</Label>
          <p className="text-sm text-muted-foreground">Get alerted when severity is 4+</p>
        </div>
        <Switch
          id="notifyOnSevere"
          checked={notifyOnSevere}
          onCheckedChange={(checked) => setValue('notifyOnSevereSeizure', checked)}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 btn-gradient">
          {initialData ? 'Save Changes' : 'Add Contact'}
        </Button>
      </div>
    </form>
  );
}
