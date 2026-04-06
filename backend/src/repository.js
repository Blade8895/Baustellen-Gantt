import { db } from './db.js';

const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  customer: row.customer,
  location: row.location,
  startDate: row.start_date,
  endDate: row.end_date,
  status: row.status,
  description: row.description,
  color: row.color,
  category: row.category,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getAllSites = () => {
  const stmt = db.prepare(`SELECT * FROM construction_sites ORDER BY start_date ASC, id ASC`);
  return stmt.all().map(mapRow);
};

export const getSiteById = (id) => {
  const stmt = db.prepare(`SELECT * FROM construction_sites WHERE id = ?`);
  const row = stmt.get(id);
  return row ? mapRow(row) : null;
};

export const createSite = (payload) => {
  const stmt = db.prepare(`
    INSERT INTO construction_sites (name, customer, location, start_date, end_date, status, description, color, category)
    VALUES (@name, @customer, @location, @startDate, @endDate, @status, @description, @color, @category)
  `);

  const result = stmt.run(payload);
  return getSiteById(result.lastInsertRowid);
};

export const updateSite = (id, payload) => {
  const stmt = db.prepare(`
    UPDATE construction_sites
    SET name=@name,
        customer=@customer,
        location=@location,
        start_date=@startDate,
        end_date=@endDate,
        status=@status,
        description=@description,
        color=@color,
        category=@category
    WHERE id=@id
  `);

  stmt.run({ id, ...payload });
  return getSiteById(id);
};

export const deleteSite = (id) => {
  const stmt = db.prepare(`DELETE FROM construction_sites WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
};
