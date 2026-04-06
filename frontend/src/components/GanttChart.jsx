import dayjs from 'dayjs';
import { Fragment } from 'react';
import { clampDays, nextMonthsRange, statusBadgeClass, statusLabel } from '../utils.js';

const monthTicks = (start, end) => {
  const ticks = [];
  let cursor = start.startOf('month');
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    ticks.push(cursor);
    cursor = cursor.add(1, 'month');
  }
  return ticks;
};

export default function GanttChart({ sites, dense = false, displayMonths = 3, referenceDate }) {
  const { start, end } = nextMonthsRange(displayMonths, referenceDate);
  const totalDays = end.diff(start, 'day') + 1;
  const ticks = monthTicks(start, end);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gantt-Übersicht (nächste {displayMonths} Monate)</h2>
        <span className="text-sm text-slate-400">
          {start.format('DD.MM.YYYY')} – {end.format('DD.MM.YYYY')}
        </span>
      </div>

      <div className="relative overflow-x-auto">
        <div
          className="grid min-w-[980px] gap-2"
          style={{ gridTemplateColumns: dense ? '260px 1fr' : '320px 1fr' }}
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">Baustelle</div>
          <div className="relative h-6 rounded bg-slate-950/50">
            {ticks.map((tick) => {
              const left = `${(tick.diff(start, 'day') / totalDays) * 100}%`;
              return (
                <div key={tick.toString()} className="absolute inset-y-0" style={{ left }}>
                  <div className="h-full border-l border-slate-700/80" />
                  <span className="absolute top-0 ml-1 text-[10px] text-slate-400">{tick.format('MMM YY')}</span>
                </div>
              );
            })}
          </div>

          {sites.map((site) => (
            <Fragment key={site.id}>
              <div key={`${site.id}-meta`} className="rounded-lg bg-slate-950/40 p-3">
                <p className="font-semibold">{site.name}</p>
                <p className="text-xs text-slate-400">
                  {site.customer} · {site.location}
                </p>
                <span className={`mt-2 inline-flex rounded px-2 py-0.5 text-xs ${statusBadgeClass[site.status]}`}>
                  {statusLabel[site.status]}
                </span>
              </div>
              <div key={`${site.id}-bar`} className="relative flex h-16 items-center rounded-lg bg-slate-950/30">
                {(site.periods || []).map((period, index) => {
                  const { offset, length } = clampDays(period.startDate, period.endDate, start, end);
                  const left = `${(offset / totalDays) * 100}%`;
                  const width = `${(length / totalDays) * 100}%`;

                  return (
                    <div
                      key={`${site.id}-period-${index}`}
                      className="absolute h-8 rounded-md border border-white/10 shadow-sm"
                      style={{ left, width, backgroundColor: `${site.color}CC` }}
                      title={`${site.name}: ${dayjs(period.startDate).format('DD.MM.')} - ${dayjs(period.endDate).format('DD.MM.')}`}
                    />
                  );
                })}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
