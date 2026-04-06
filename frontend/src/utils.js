import dayjs from 'dayjs';

export const statusLabel = {
  geplant: 'Geplant',
  in_arbeit: 'In Arbeit',
  pausiert: 'Pausiert',
  fertig: 'Fertig',
};

export const statusBadgeClass = {
  geplant: 'bg-cyan-500/20 text-cyan-200',
  in_arbeit: 'bg-amber-500/20 text-amber-200',
  pausiert: 'bg-rose-500/20 text-rose-200',
  fertig: 'bg-emerald-500/20 text-emerald-200',
};

export const nextMonthsRange = (months = 3, referenceDate) => {
  const start = dayjs(referenceDate || undefined).startOf('day');
  const end = start.add(months, 'month').endOf('day');
  return { start, end };
};

export const clampDays = (startDate, endDate, rangeStart, rangeEnd) => {
  const start = dayjs(startDate).isBefore(rangeStart) ? rangeStart : dayjs(startDate);
  const end = dayjs(endDate).isAfter(rangeEnd) ? rangeEnd : dayjs(endDate);
  const totalDays = rangeEnd.diff(rangeStart, 'day') + 1;
  const offset = Math.max(0, start.diff(rangeStart, 'day'));
  const length = Math.max(1, end.diff(start, 'day') + 1);

  return {
    offset,
    length,
    totalDays,
  };
};

const getUpcomingDate = (site, referenceDate) => {
  const ref = dayjs(referenceDate).startOf('day');
  const periods = [...(site.periods || [])].sort((a, b) => a.startDate.localeCompare(b.startDate));

  for (const period of periods) {
    const start = dayjs(period.startDate).startOf('day');
    const end = dayjs(period.endDate).endOf('day');
    if (ref.isBefore(start)) return start;
    if ((ref.isAfter(start) || ref.isSame(start)) && (ref.isBefore(end) || ref.isSame(end))) return ref;
  }

  const fallbackEnd = periods.at(-1)?.endDate || site.endDate;
  return dayjs(fallbackEnd).add(100, 'year');
};

export const sortSitesByUpcoming = (sites, referenceDate) =>
  [...sites].sort((a, b) => {
    const left = getUpcomingDate(a, referenceDate);
    const right = getUpcomingDate(b, referenceDate);
    if (left.isSame(right, 'day')) {
      return (a.name || '').localeCompare(b.name || '', 'de');
    }
    return left.isBefore(right) ? -1 : 1;
  });
