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
  ['Schulhof Modernisierung', 'Stadtbauamt', 'Ingolstadt', addDays(-12), addDays(8), 'in_arbeit', 'Abnahme der Spielgeräte offen', '#34d399', 'Hochbau'],
  ['Kanalsanierung Innenstadt', 'Stadtentwässerung', 'Regensburg', addDays(12), addDays(68), 'geplant', 'Umleitung über Nordroute abgestimmt', '#38bdf8', 'Sanierung'],
  ['Neubau Feuerwehrhaus', 'Gemeinde Ost', 'Freising', addDays(20), addDays(120), 'geplant', 'Statikfreigabe noch ausstehend', '#f43f5e', 'Hochbau'],
  ['Straßenbeleuchtung Süd', 'Kommunalbetrieb', 'Erding', addDays(-6), addDays(24), 'in_arbeit', 'Mastfundamente in 3 Bauabschnitten', '#eab308', 'Infrastruktur'],
  ['Fernwärme Trasse Nord', 'Wärmeversorgung GmbH', 'Nürnberg', addDays(15), addDays(82), 'geplant', 'Sperrzeitfenster mit ÖPNV abstimmen', '#06b6d4', 'Tiefbau'],
  ['Parkhaus Deckensanierung', 'CityPark AG', 'Rosenheim', addDays(-20), addDays(18), 'in_arbeit', 'Betoninstandsetzung Ebene 2 läuft', '#818cf8', 'Sanierung'],
  ['Umgestaltung Marktplatz', 'Stadtverwaltung', 'Landshut', addDays(30), addDays(96), 'geplant', 'Pflasterlieferung bestätigt', '#10b981', 'Städtebau'],
  ['Kita Erweiterungsbau', 'Sozialreferat', 'Passau', addDays(7), addDays(110), 'geplant', 'Bauantrag genehmigt', '#fb7185', 'Hochbau'],
  ['Radweg Donauufer', 'Tiefbauamt', 'Deggendorf', addDays(3), addDays(44), 'in_arbeit', 'Asphaltierung in zwei Etappen', '#22c55e', 'Infrastruktur'],
  ['Gehwegsanierung Bahnhof', 'Stadtwerke Mobilität', 'Kempten', addDays(18), addDays(52), 'geplant', 'Barrierefreie Querungen vorgesehen', '#f59e0b', 'Sanierung'],
  ['Verkehrsknoten West', 'Landesbetrieb Straßenbau', 'Memmingen', addDays(40), addDays(140), 'geplant', 'Signaltechnik in separater Vergabe', '#0ea5e9', 'Tiefbau'],
  ['Rathaus Fassadenarbeiten', 'Hochbauamt', 'Bamberg', addDays(-4), addDays(35), 'in_arbeit', 'Gerüstfreigabe erfolgt', '#a855f7', 'Sanierung'],
  ['Sporthalle Dachabdichtung', 'Schulverband Mitte', 'Coburg', addDays(22), addDays(63), 'geplant', 'Witterungsabhängige Ausführung', '#14b8a6', 'Hochbau']
];

for (const row of demo) insert.run(...row);

console.log(`Seed erfolgreich: ${demo.length} Datensätze angelegt.`);
