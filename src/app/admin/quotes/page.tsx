import React from 'react';
import fs from 'fs';
import path from 'path';
import AdminDashboard from '../../../components/AdminDashboard';
import '../admin.css';

export default function AdminQuotesPage() {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  
  let catalog = [];
  try { catalog = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalog.json'), 'utf-8')); } catch (e) {}

  let quotes = [];
  try { quotes = JSON.parse(fs.readFileSync(path.join(dataDir, 'estimates-req.json'), 'utf-8')); } catch (e) {}

  let searchLogs = [];
  try { searchLogs = JSON.parse(fs.readFileSync(path.join(dataDir, 'search-logs.json'), 'utf-8')); } catch (e) {}

  return <AdminDashboard initialCatalog={catalog} initialQuotes={quotes} initialSearchLogs={searchLogs} />;
}
