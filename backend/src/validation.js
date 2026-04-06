import { z } from 'zod';

export const statusValues = ['geplant', 'in_arbeit', 'pausiert', 'fertig'];

export const siteSchema = z
  .object({
    name: z.string().min(2).max(120),
    customer: z.string().min(2).max(120),
    location: z.string().min(2).max(120),
    startDate: z.string().date(),
    endDate: z.string().date(),
    status: z.enum(statusValues),
    description: z.string().max(1000).optional().default(''),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    category: z.string().max(80).optional().default('Allgemein'),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Startdatum muss vor dem Enddatum liegen.',
    path: ['endDate'],
  });
