import { useEffect, useMemo, useState } from 'react';

const buildInitialForm = () => ({
  name: '',
  customer: '',
  location: '',
  description: '',
  color: '#22d3ee',
  category: 'Allgemein',
  periods: [{ startDate: '', endDate: '' }],
});

export default function SiteForm({ selected, onSave, onCancel }) {
  const [form, setForm] = useState(buildInitialForm());
  const [error, setError] = useState('');

  const title = useMemo(() => (selected?.id ? 'Baustelle bearbeiten' : 'Baustelle anlegen'), [selected]);

  useEffect(() => {
    if (!selected) {
      setForm(buildInitialForm());
      return;
    }

    setForm({
      name: selected.name || '',
      customer: selected.customer || '',
      location: selected.location || '',
      description: selected.description || '',
      color: selected.color || '#22d3ee',
      category: selected.category || 'Allgemein',
      periods: selected.periods?.length ? selected.periods : [{ startDate: selected.startDate, endDate: selected.endDate }],
    });
  }, [selected]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updatePeriod = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      periods: prev.periods.map((period, i) => (i === index ? { ...period, [field]: value } : period)),
    }));
  };

  const addPeriod = () => {
    setForm((prev) => ({ ...prev, periods: [...prev.periods, { startDate: '', endDate: '' }] }));
  };

  const removePeriod = (index) => {
    setForm((prev) => ({
      ...prev,
      periods: prev.periods.filter((_period, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.customer || !form.location || form.periods.length === 0) {
      setError('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }

    const hasInvalidPeriod = form.periods.some((period) => !period.startDate || !period.endDate || period.startDate > period.endDate);
    if (hasInvalidPeriod) {
      setError('Bitte gültige Zeiträume eintragen (Start <= Ende).');
      return;
    }

    setError('');
    await onSave({ ...form, periods: [...form.periods].sort((a, b) => a.startDate.localeCompare(b.startDate)) });
    if (!selected?.id) setForm(buildInitialForm());
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

      <div className="space-y-2 rounded-md border border-slate-800 p-3">
        <p className="text-sm text-slate-300">Zeiträume (mehrere möglich)</p>
        {form.periods.map((period, index) => (
          <div key={`period-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="text-sm">
              <span className="mb-1 block text-slate-300">Startdatum</span>
              <input
                type="date"
                required
                value={period.startDate}
                onChange={(event) => updatePeriod(index, 'startDate', event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-300">Enddatum</span>
              <input
                type="date"
                required
                value={period.endDate}
                onChange={(event) => updatePeriod(index, 'endDate', event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <button
              type="button"
              className="self-end rounded-md border border-rose-800 px-3 py-2 text-sm text-rose-300 hover:bg-rose-900/40"
              onClick={() => removePeriod(index)}
              disabled={form.periods.length === 1}
            >
              Entfernen
            </button>
          </div>
        ))}
        <button type="button" onClick={addPeriod} className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">
          Zeitraum hinzufügen
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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
