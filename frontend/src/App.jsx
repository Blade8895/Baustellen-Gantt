import { NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { api, socket } from './api.js';
import SiteForm from './components/SiteForm.jsx';
import SiteTable from './components/SiteTable.jsx';
import GanttChart from './components/GanttChart.jsx';
import { sortSitesByUpcoming } from './utils.js';

function useSites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSites = async () => {
    setLoading(true);
    const response = await api.get('/api/sites');
    setSites(response.data);
    setLoading(false);
  };

  useEffect(() => {
    loadSites();
    socket.on('sites:sync', (data) => setSites(data));
    socket.on('sites:changed', () => loadSites());
    return () => {
      socket.off('sites:sync');
      socket.off('sites:changed');
    };
  }, []);

  return { sites, loading, reload: loadSites, setSites };
}

function useSettings() {
  const [settings, setSettings] = useState({
    displayMonths: 3,
    tvPageSize: 8,
    tvPageSwitchSeconds: 60,
    manualCurrentDate: null,
    tvResolution: '1920x1080',
    tvTitle: 'Baustellen Übersicht',
    tvSubtitle: 'Live vom lokalen System · Nur Anzeige',
    tvShowPageIndicator: true,
    tvLogoDataUrl: null,
  });

  const loadSettings = async () => {
    const response = await api.get('/api/settings');
    setSettings(response.data);
  };

  const saveSettings = async (nextSettings) => {
    const response = await api.put('/api/settings', nextSettings);
    setSettings(response.data);
  };

  useEffect(() => {
    loadSettings();
    socket.on('settings:sync', (data) => setSettings(data));
    socket.on('settings:changed', (data) => setSettings(data));
    return () => {
      socket.off('settings:sync');
      socket.off('settings:changed');
    };
  }, []);

  return { settings, saveSettings, reloadSettings: loadSettings };
}

function SettingsForm({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState('');
  const [logoError, setLogoError] = useState('');

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      displayMonths: Number(form.displayMonths),
      tvPageSize: Number(form.tvPageSize),
      tvPageSwitchSeconds: Number(form.tvPageSwitchSeconds),
      manualCurrentDate: form.manualCurrentDate || null,
    });
    setMessage('Einstellungen gespeichert.');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleLogoUpload = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('Bitte eine Bilddatei auswählen.');
      return;
    }

    if (file.size > 1024 * 1024) {
      setLogoError('Das Logo darf maximal 1 MB groß sein.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, tvLogoDataUrl: reader.result }));
      setLogoError('');
    };
    reader.onerror = () => {
      setLogoError('Logo konnte nicht gelesen werden.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold">Allgemeine Einstellungen</h2>
      {message && <p className="rounded bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">{message}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Angezeigte Monate</span>
          <input type="number" min={1} max={24} value={form.displayMonths} onChange={(e) => setForm((prev) => ({ ...prev, displayMonths: e.target.value }))} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Baustellen pro TV-Seite</span>
          <input type="number" min={1} max={50} value={form.tvPageSize} onChange={(e) => setForm((prev) => ({ ...prev, tvPageSize: e.target.value }))} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Seitenwechsel (Sekunden)</span>
          <input type="number" min={10} max={3600} value={form.tvPageSwitchSeconds} onChange={(e) => setForm((prev) => ({ ...prev, tvPageSwitchSeconds: e.target.value }))} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Manuelles Datum (Debug)</span>
          <input type="date" value={form.manualCurrentDate || ''} onChange={(e) => setForm((prev) => ({ ...prev, manualCurrentDate: e.target.value || null }))} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">TV-Auflösung</span>
          <select value={form.tvResolution} onChange={(e) => setForm((prev) => ({ ...prev, tvResolution: e.target.value }))} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2">
            <option value="1280x720">HD (1280×720)</option>
            <option value="1366x768">WXGA (1366×768)</option>
            <option value="1600x900">HD+ (1600×900)</option>
            <option value="1920x1080">Full HD (1920×1080)</option>
            <option value="2560x1440">QHD (2560×1440)</option>
            <option value="3840x2160">4K UHD (3840×2160)</option>
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-slate-300">Überschrift TV-Ansicht</span>
          <input type="text" maxLength={120} value={form.tvTitle} onChange={(e) => setForm((prev) => ({ ...prev, tvTitle: e.target.value }))} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-slate-300">Subtext TV-Ansicht</span>
          <input type="text" maxLength={240} value={form.tvSubtitle} onChange={(e) => setForm((prev) => ({ ...prev, tvSubtitle: e.target.value }))} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" checked={form.tvShowPageIndicator} onChange={(e) => setForm((prev) => ({ ...prev, tvShowPageIndicator: e.target.checked }))} />
          <span className="text-slate-300">Seitenanzeige (x/x) in der TV-Ansicht anzeigen</span>
        </label>
        <div className="space-y-2 text-sm md:col-span-2">
          <span className="mb-1 block text-slate-300">Logo (oben rechts)</span>
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" />
          {logoError && <p className="text-rose-300">{logoError}</p>}
          {form.tvLogoDataUrl && (
            <div className="flex items-center gap-4">
              <img src={form.tvLogoDataUrl} alt="Vorschau Logo" className="h-16 w-auto rounded border border-slate-700 bg-slate-900 p-1" />
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, tvLogoDataUrl: null }))} className="rounded-md border border-slate-700 px-3 py-2 hover:bg-slate-800">
                Logo entfernen
              </button>
            </div>
          )}
        </div>
      </div>
      <button type="submit" className="rounded-md bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400">Speichern</button>
    </form>
  );
}

function UserView() {
  const { sites, loading, reload } = useSites();
  const { settings } = useSettings();
  const [selected, setSelected] = useState(null);

  const saveSite = async (payload) => {
    if (selected?.id) {
      await api.put(`/api/sites/${selected.id}`, payload);
      setSelected(null);
    } else {
      await api.post('/api/sites', payload);
    }
    await reload();
  };

  const deleteSite = async (id) => {
    if (!window.confirm('Baustelle wirklich löschen?')) return;
    await api.delete(`/api/sites/${id}`);
    await reload();
    if (selected?.id === id) setSelected(null);
  };

  const sorted = useMemo(
    () => sortSitesByUpcoming(sites, settings.manualCurrentDate || dayjs().format('YYYY-MM-DD')),
    [sites, settings.manualCurrentDate],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Baustellen-Verwaltung</h1>
        <div className="flex gap-2">
          <NavLink to="/settings" className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">Einstellungen</NavLink>
          <NavLink to="/tv" className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">Zur TV-Ansicht</NavLink>
        </div>
      </header>
      <SiteForm selected={selected} onSave={saveSite} onCancel={() => setSelected(null)} />
      {loading ? <p>Lade Baustellen...</p> : <SiteTable sites={sorted} onEdit={setSelected} onDelete={deleteSite} />}
    </div>
  );
}

function TvView() {
  const { sites, loading } = useSites();
  const { settings } = useSettings();
  const [page, setPage] = useState(0);
  const referenceDate = settings.manualCurrentDate || dayjs().format('YYYY-MM-DD');

  const sorted = useMemo(() => sortSitesByUpcoming(sites, referenceDate), [sites, referenceDate]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / settings.tvPageSize));
  const pagedSites = useMemo(() => {
    const startIndex = page * settings.tvPageSize;
    return sorted.slice(startIndex, startIndex + settings.tvPageSize);
  }, [page, settings.tvPageSize, sorted]);

  useEffect(() => {
    setPage((prev) => (prev >= pageCount ? 0 : prev));
  }, [pageCount]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPage((prev) => (prev + 1) % pageCount);
    }, Math.max(10, settings.tvPageSwitchSeconds) * 1000);

    return () => window.clearInterval(interval);
  }, [pageCount, settings.tvPageSwitchSeconds]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 p-8 text-slate-100">
      <header className="mb-6 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{settings.tvTitle}</h1>
          <p className="text-slate-400">{settings.tvSubtitle}</p>
          {settings.tvShowPageIndicator && <p className="text-slate-500">Seite {page + 1} / {pageCount}</p>}
        </div>
        {settings.tvLogoDataUrl ? <img src={settings.tvLogoDataUrl} alt="Firmenlogo" className="h-20 w-auto object-contain" /> : null}
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <p className="text-xl">Lade Daten...</p>
        ) : (
          <GanttChart
            sites={pagedSites}
            dense
            displayMonths={settings.displayMonths}
            referenceDate={referenceDate}
            tvResolution={settings.tvResolution}
            tvPageSize={settings.tvPageSize}
          />
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { settings, saveSettings } = useSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <NavLink to="/" className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">Zurück</NavLink>
      </header>
      <SettingsForm settings={settings} onSave={saveSettings} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserView />} />
      <Route path="/tv" element={<TvView />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
