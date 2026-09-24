import React from 'react';
import fs from 'fs';
import path from 'path';
import AdminDashboard from '../../components/AdminDashboard';
import './admin.css';

export default function AdminPage() {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  
  // Read Catalog
  let catalog = [];
  try {
    const catalogData = fs.readFileSync(path.join(dataDir, 'catalog.json'), 'utf-8');
    catalog = JSON.parse(catalogData);
  } catch (e) { console.error('Error reading catalog'); }

  // Read Quotes
  let quotes = [];
  try {
    const quotesData = fs.readFileSync(path.join(dataDir, 'estimates-req.json'), 'utf-8');
    quotes = JSON.parse(quotesData);
  } catch (e) { console.error('Error reading quotes'); }

  // Read Search Logs
  let searchLogs = [];
  try {
    const searchData = fs.readFileSync(path.join(dataDir, 'search-logs.json'), 'utf-8');
    searchLogs = JSON.parse(searchData);
  } catch (e) { console.error('Error reading search logs'); }

  return (
    <AdminDashboard initialCatalog={catalog} initialQuotes={quotes} initialSearchLogs={searchLogs} />
  );
}
