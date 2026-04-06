import { useMemo, useState } from 'react';
import { statusLabel } from '../utils.js';

const initialForm = {
  name: '',
  customer: '',
  location: '',
  startDate: '',
  endDate: '',
  status: 'geplant',
  description: '',
  color: '#22d3ee',
  category: 'Allgemein',
};

export default function SiteForm({ selected, onSave, onCancel }) {
  const [form, setForm] = useState(selected || initialForm);
  const [error, setError] = useState('');

  const title = useMemo(() => (selected?.id ? 'Baustelle bearbeiten' : 'Baustelle anlegen'), [selected]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.customer || !form.location || !form.startDate || !form.endDate) {
      setError('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }
    if (form.startDate > form.endDate) {
      setError('Startdatum darf nicht nach dem Enddatum liegen.');
      return;
    }
    setError('');
    await onSave(form);
    if (!selected?.id) setForm(initialForm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {error && <p className="rounded bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{error}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['name', 'Baustellenname'],
          ['customer', 'Kunde / Auftraggeber'],
          ['location', 'Ort'],
          ['category', 'Kategorie'],
        ].map(([name, label]) => (
          <label key={name} className="text-sm">
            <span className="mb-1 block text-slate-300">{label}</span>
            <input
              required={name !== 'category'}
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Startdatum</span>
          <input type="date" required name="startDate" value={form.startDate} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Enddatum</span>
          <input type="date" required name="endDate" value={form.endDate} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Status</span>
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2">
            {Object.entries(statusLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Farbe</span>
          <input type="color" name="color" value={form.color} onChange={handleChange} className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-2" />
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block text-slate-300">Beschreibung / Notiz</span>
        <textarea name="description" value={form.description} onChange={handleChange} className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
      </label>

      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400">Speichern</button>
        {selected?.id && (
          <button type="button" className="rounded-md border border-slate-700 px-4 py-2 hover:bg-slate-800" onClick={onCancel}>Abbrechen</button>
        )}
      </div>
    </form>
  );
}
