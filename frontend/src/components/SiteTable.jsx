import dayjs from 'dayjs';
import { statusBadgeClass, statusLabel } from '../utils.js';

export default function SiteTable({ sites, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="mb-4 text-lg font-semibold">Alle Baustellen</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="pb-2">Name</th>
              <th className="pb-2">Kunde</th>
              <th className="pb-2">Zeiträume</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id} className="border-b border-slate-900 align-top">
                <td className="py-3">
                  <p className="font-medium">{site.name}</p>
                  <p className="text-xs text-slate-500">{site.location}</p>
                </td>
                <td className="py-3">{site.customer}</td>
                <td className="py-3">
                  <div className="space-y-1">
                    {(site.periods || []).map((period, index) => (
                      <p key={`${site.id}-period-${index}`}>
                        {dayjs(period.startDate).format('DD.MM.YYYY')} – {dayjs(period.endDate).format('DD.MM.YYYY')}
                      </p>
                    ))}
                  </div>
                </td>
                <td className="py-3">
                  <span className={`rounded px-2 py-0.5 text-xs ${statusBadgeClass[site.status]}`}>{statusLabel[site.status]}</span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(site)} className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">Bearbeiten</button>
                    <button onClick={() => onDelete(site.id)} className="rounded border border-rose-800 px-2 py-1 text-rose-300 hover:bg-rose-900/40">Löschen</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
