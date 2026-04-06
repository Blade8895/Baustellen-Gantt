import { z } from 'zod';

export const statusValues = ['geplant', 'in_arbeit', 'pausiert', 'fertig'];

const periodSchema = z
  .object({
    startDate: z.string().date(),
    endDate: z.string().date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Startdatum muss vor dem Enddatum liegen.',
    path: ['endDate'],
  });

export const siteSchema = z
  .object({
    name: z.string().min(2).max(120),
    customer: z.string().min(2).max(120),
    location: z.string().min(2).max(120),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    status: z.enum(statusValues).optional(),
    description: z.string().max(1000).optional().default(''),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    category: z.string().max(80).optional().default('Allgemein'),
    periods: z.array(periodSchema).min(1),
  })
  .transform((data) => {
    const periods = [...data.periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
    return {
      ...data,
      startDate: periods[0].startDate,
      endDate: periods[periods.length - 1].endDate,
      status: 'geplant',
      periods,
    };
  });

export const settingsSchema = z.object({
  displayMonths: z.number().int().min(1).max(24),
  tvPageSize: z.number().int().min(1).max(50),
  tvPageSwitchSeconds: z.number().int().min(10).max(3600),
  manualCurrentDate: z.union([z.string().date(), z.null()]),
  tvResolution: z.enum(['1280x720', '1366x768', '1600x900', '1920x1080', '2560x1440', '3840x2160']),
});
