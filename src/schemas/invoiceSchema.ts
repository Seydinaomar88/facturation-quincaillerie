import { z } from 'zod';

export const invoiceSchema = z.object({
  client_name: z.string().min(1, "Le nom du client est obligatoire"),
  amount: z.number().min(0.01, "Le montant doit être positif"),
  due_date: z.string().min(1, "La date d'échéance est obligatoire"),
});

export const paymentSchema = z.object({
  amount: z.number().min(0.01, "Le montant du paiement doit être positif"),
});