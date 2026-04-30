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
  tvTitle: z.string().trim().min(1).max(120),
  tvSubtitle: z.string().trim().max(240),
  tvShowPageIndicator: z.boolean(),
  tvLogoDataUrl: z.union([z.string().startsWith('data:image/').max(1_500_000), z.null()]),
  tvPlaybackPaused: z.boolean(),
  tvPinnedPage: z.union([z.number().int().min(1).max(999), z.null()]),
  tvPinnedUntil: z.union([z.string().datetime({ offset: true }), z.null()]),
  layoutHeaderFontSize: z.number().int().min(10).max(40),
  layoutWeekFontSize: z.number().int().min(9).max(28),
  layoutWeekDateFontSize: z.number().int().min(8).max(24),
  layoutMetaFontSize: z.number().int().min(10).max(34),
  layoutPeriodFontSize: z.number().int().min(9).max(24),
  layoutSiteColumnMinWidth: z.number().int().min(180).max(900),
  layoutTimelineLeadIn: z.number().int().min(0).max(80),
  layoutColumnGap: z.number().int().min(0).max(80),
  layoutTagGap: z.number().int().min(0).max(40),
  layoutStatusTagFontSize: z.number().int().min(9).max(24),
  layoutStatusTagPaddingX: z.number().int().min(2).max(20),
  layoutStatusTagPaddingY: z.number().int().min(0).max(12),
  layoutStatusTagBorderRadius: z.number().int().min(0).max(30),
  layoutRowHeight: z.number().int().min(0).max(220),
  layoutBoldText: z.boolean(),
});
