import { zodResolver } from '@hookform/resolvers/zod';
import { time } from 'console';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const profileFormSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório'),
  address: z.string().optional(),
  phone: z.string().optional(),
  status: z.string(),
  timezone: z.string().min(1, 'O fuso horário é obrigatório'),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function useProfileForm() {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      status: 'Ativo',
      timezone: '',
    },
  });

  return form;
}