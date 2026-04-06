import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { config } from './config.js';
import { siteSchema } from './validation.js';
import { createSite, deleteSite, getAllSites, getSiteById, updateSite } from './repository.js';

const app = express();
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'baustellen-backend' });
});

app.get('/api/sites', (_req, res) => {
  res.json(getAllSites());
});

app.get('/api/sites/:id', (req, res) => {
  const site = getSiteById(Number(req.params.id));
  if (!site) return res.status(404).json({ message: 'Baustelle nicht gefunden.' });
  return res.json(site);
});

app.post('/api/sites', (req, res) => {
  const parsed = siteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validierungsfehler', errors: parsed.error.flatten() });
  }

  const created = createSite(parsed.data);
  io.emit('sites:changed', { action: 'created', site: created });
  return res.status(201).json(created);
});

app.put('/api/sites/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!getSiteById(id)) return res.status(404).json({ message: 'Baustelle nicht gefunden.' });

  const parsed = siteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validierungsfehler', errors: parsed.error.flatten() });
  }

  const updated = updateSite(id, parsed.data);
  io.emit('sites:changed', { action: 'updated', site: updated });
  return res.json(updated);
});

app.delete('/api/sites/:id', (req, res) => {
  const id = Number(req.params.id);
  const removed = deleteSite(id);
  if (!removed) return res.status(404).json({ message: 'Baustelle nicht gefunden.' });
  io.emit('sites:changed', { action: 'deleted', id });
  return res.status(204).send();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Unerwarteter Serverfehler.' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  },
});

io.on('connection', (socket) => {
  socket.emit('sites:sync', getAllSites());
});

server.listen(config.port, config.host, () => {
  console.log(`Backend läuft unter http://${config.host}:${config.port}`);
});
