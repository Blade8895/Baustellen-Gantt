import { NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api, socket } from './api.js';
import SiteForm from './components/SiteForm.jsx';
import SiteTable from './components/SiteTable.jsx';
import GanttChart from './components/GanttChart.jsx';

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

function UserView() {
  const { sites, loading, reload } = useSites();
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Baustellen-Verwaltung</h1>
        <NavLink to="/tv" className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
          Zur TV-Ansicht
        </NavLink>
      </header>
      <SiteForm selected={selected} onSave={saveSite} onCancel={() => setSelected(null)} />
      {loading ? <p>Lade Baustellen...</p> : <SiteTable sites={sites} onEdit={setSelected} onDelete={deleteSite} />}
    </div>
  );
}

function TvView() {
  const { sites, loading } = useSites();
  const sorted = useMemo(() => sites, [sites]);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Baustellen Übersicht</h1>
          <p className="text-slate-400">Live vom lokalen System · Nur Anzeige</p>
        </div>
        <NavLink to="/" className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
          Zur Verwaltung
        </NavLink>
      </header>
      {loading ? <p className="text-xl">Lade Daten...</p> : <GanttChart sites={sorted} dense />}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserView />} />
      <Route path="/tv" element={<TvView />} />
    </Routes>
  );
}
