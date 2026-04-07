import { db } from './db.js';

const existing = db.prepare('SELECT COUNT(*) as count FROM construction_sites').get().count;
if (existing > 0) {
  console.log('Seed übersprungen: Daten vorhanden.');
  process.exit(0);
}

const insert = db.prepare(`
  INSERT INTO construction_sites (name, customer, location, start_date, end_date, status, description, color, category)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertPeriod = db.prepare(`
  INSERT INTO site_periods (site_id, start_date, end_date)
  VALUES (?, ?, ?)
`);

const today = new Date();
const formatDate = (date) => date.toISOString().slice(0, 10);
const addDays = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

const baseProjects = [
  ['Leitungsbau Nordring', 'Stadtwerke A', 'München', 'Tiefbau'],
  ['Brückensanierung B17', 'Landkreis Süd', 'Augsburg', 'Sanierung'],
  ['Glasfaser Quartier West', 'NetConnect GmbH', 'Ulm', 'Infrastruktur'],
  ['Schulhof Modernisierung', 'Stadtbauamt', 'Ingolstadt', 'Hochbau'],
  ['Kanalsanierung Innenstadt', 'Stadtentwässerung', 'Regensburg', 'Sanierung'],
  ['Neubau Feuerwehrhaus', 'Gemeinde Ost', 'Freising', 'Hochbau'],
  ['Straßenbeleuchtung Süd', 'Kommunalbetrieb', 'Erding', 'Infrastruktur'],
  ['Fernwärme Trasse Nord', 'Wärmeversorgung GmbH', 'Nürnberg', 'Tiefbau'],
];

const colors = ['#22d3ee', '#a78bfa', '#f97316', '#34d399', '#38bdf8', '#f43f5e', '#eab308', '#06b6d4'];
const descriptions = [
  'Abstimmung mit Verkehrslenkung',
  'Materiallieferung in Teilabschnitten',
  'Sperrpausen mit Anwohnerinfo',
  'Arbeiten in mehreren Bauphasen',
];

let count = 0;
for (let i = 0; i < 32; i += 1) {
  const [name, customer, location, category] = baseProjects[i % baseProjects.length];
  const projectName = `${name} ${String.fromCharCode(65 + Math.floor(i / baseProjects.length))}`;
  const status = i % 6 === 0 ? 'in_arbeit' : 'geplant';
  const color = colors[i % colors.length];
  const description = descriptions[i % descriptions.length];

  const phaseStart = -15 + i * 2;
  const periods = [
    { startDate: addDays(phaseStart), endDate: addDays(phaseStart + 10) },
    { startDate: addDays(phaseStart + 16), endDate: addDays(phaseStart + 33) },
  ];
  if (i % 3 === 0) {
    periods.push({ startDate: addDays(phaseStart + 40), endDate: addDays(phaseStart + 54) });
  }

  const result = insert.run(
    projectName,
    customer,
    location,
    periods[0].startDate,
    periods[periods.length - 1].endDate,
    status,
    description,
    color,
    category,
  );

  for (const period of periods) {
    insertPeriod.run(result.lastInsertRowid, period.startDate, period.endDate);
  }
  count += 1;
}

console.log(`Seed erfolgreich: ${count} Datensätze mit mehrteiligen Zeitstrahlen angelegt.`);
