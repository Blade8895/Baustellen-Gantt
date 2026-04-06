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

export const nextMonthsRange = (months = 3) => {
  const start = dayjs().startOf('day');
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
