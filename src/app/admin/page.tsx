import React from 'react';
import fs from 'fs';
import path from 'path';
import AdminDashboard from '../../components/AdminDashboard';
import './admin.css';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  
  // Fetch Catalog from Database API
  let catalog = [];
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    const res = await fetch(`${backendUrl}/api/catalog`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      catalog = data.catalog || [];
    }
  } catch (e) {
    console.error('Error fetching catalog from DB API');
  }

  // Read Quotes (still local JSON)
  let quotes = [];
  try {
    const quotesData = fs.readFileSync(path.join(dataDir, 'estimates-req.json'), 'utf-8');
    quotes = JSON.parse(quotesData);
  } catch (e) { }

  // Read Search Logs (still local JSON)
  let searchLogs = [];
  try {
    const searchData = fs.readFileSync(path.join(dataDir, 'search-logs.json'), 'utf-8');
    searchLogs = JSON.parse(searchData);
  } catch (e) { }

  return (
    <AdminDashboard initialCatalog={catalog} initialQuotes={quotes} initialSearchLogs={searchLogs} />
  );
}
