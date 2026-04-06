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

const today = new Date();
const formatDate = (date) => date.toISOString().slice(0, 10);
const addDays = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

const demo = [
  ['Leitungsbau Nordring', 'Stadtwerke A', 'München', addDays(1), addDays(28), 'in_arbeit', 'Straßensperrung Abschnitt 2', '#22d3ee', 'Tiefbau'],
  ['Brückensanierung B17', 'Landkreis Süd', 'Augsburg', addDays(10), addDays(55), 'geplant', 'Nachtarbeiten in KW 19', '#a78bfa', 'Sanierung'],
  ['Glasfaser Quartier West', 'NetConnect GmbH', 'Ulm', addDays(5), addDays(75), 'geplant', 'Koordination mit Versorgern notwendig', '#f97316', 'Infrastruktur'],
  ['Schulhof Modernisierung', 'Stadtbauamt', 'Ingolstadt', addDays(-12), addDays(8), 'in_arbeit', 'Abnahme der Spielgeräte offen', '#34d399', 'Hochbau']
];

for (const row of demo) insert.run(...row);

console.log(`Seed erfolgreich: ${demo.length} Datensätze angelegt.`);
