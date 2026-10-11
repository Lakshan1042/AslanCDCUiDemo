'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search, RefreshCw, AlertCircle, X, Folder,
  ArrowRight, Filter, Box, Loader2, ShieldCheck
} from 'lucide-react';

export interface ApiInventoryItem {
  id: number;
  name: string;
  category: string | null;
  quantity: number;
  shelfId: number;
  shelfName?: string;
  cupboardId?: number;
  cupboardName?: string;
  status: 'GOOD' | 'NEED_MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  location?: {
    shelfId: number;
    shelfName: string;
    cupboardId: number;
    cupboardName: string;
  };
}

export interface ApiCupboard {
  id: number;
  name: string;
  description: string | null;
}

const PRESET_CATEGORIES = [
  'Vestibular & Balance',
  'Sensory & Tactile Tools',
  'Fine Motor & Coordination',
  'Gross Motor Equipment',
  'Oral Motor & Feeding',
  'Cognitive & Perceptual',
  'ADL & Adaptive Tools',
  'General Clinical Supplies'
];

function normalizeApiItem(raw: any): ApiInventoryItem {
  const cupboardId = raw.cupboardId ?? raw.location?.cupboardId ?? 0;
  const cupboardName = raw.cupboardName || raw.location?.cupboardName || 'Cupboard';
  const shelfId = raw.shelfId ?? raw.location?.shelfId ?? 0;
  const shelfName = raw.shelfName || raw.location?.shelfName || 'Shelf';
  return {
    ...raw,
    cupboardId,
    cupboardName,
    shelfId,
    shelfName,
    location: {
      cupboardId,
      cupboardName,
      shelfId,
      shelfName,
    },
  };
}

export const TherapistInventoryView: React.FC = () => {
  // Data states
  const [items, setItems] = useState<ApiInventoryItem[]>([]);
  const [cupboards, setCupboards] = useState<ApiCupboard[]>([]);

  // Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cupboardFilter, setCupboardFilter] = useState('all');

  // Request sequencing to prevent race conditions
  const seqRef = useRef<number>(0);

  // 1. Fetch Cupboards for filter options
  const fetchCupboards = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory/cupboards', {
        method: 'GET',
        credentials: 'include',
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && Array.isArray(json.data)) {
        setCupboards(json.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description ?? null,
        })));
      }
    } catch {
      // Non-fatal if cupboards filter list fails
    }
  }, []);

  // 2. Fetch Inventory Items with query params & race-condition cancellation
  const fetchItems = useCallback(async () => {
    const currentSeq = ++seqRef.current;
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set('searchTerm', searchTerm.trim());
      }
      if (categoryFilter !== 'all') {
        params.set('category', categoryFilter);
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (cupboardFilter !== 'all') {
        params.set('cupboardId', cupboardFilter);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/inventory/items${queryString}`, {
        method: 'GET',
        credentials: 'include',
      });
      const json = await res.json().catch(() => null);

      // Discard stale responses if newer search was dispatched
      if (currentSeq !== seqRef.current) return;

      if (res.ok && json?.success && Array.isArray(json.data)) {
        setItems(json.data.map(normalizeApiItem));
        setErrorMessage(null);
      } else {
        setErrorMessage(json?.message || 'Failed to load clinic equipment');
      }
    } catch (err: any) {
      if (currentSeq === seqRef.current) {
        setErrorMessage(err?.message || 'Unable to connect to inventory service');
      }
    } finally {
      if (currentSeq === seqRef.current) {
        setIsLoading(false);
      }
    }
  }, [searchTerm, categoryFilter, statusFilter, cupboardFilter]);

  // Initial load
  useEffect(() => {
    fetchCupboards();
  }, [fetchCupboards]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Derived available categories from live items and clinical presets
  const availableCategories = useMemo(() => {
    const cats = new Set<string>(PRESET_CATEGORIES);
    for (const item of items) {
      if (item.category) cats.add(item.category);
    }
    return Array.from(cats);
  }, [items]);

  // Summary counts
  const totalUnits = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);
  const maintenanceCount = useMemo(() => items.filter(i => i.status === 'NEED_MAINTENANCE').length, [items]);
  const operationalCount = useMemo(() => items.filter(i => i.status === 'GOOD').length, [items]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Role Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Clinic Equipment Inventory</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-slate-500" />
              <span>Read-Only View</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Search therapy gear and check physical cupboard & shelf locations in real time.
          </p>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchCupboards();
              fetchItems();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition duration-150 shadow-sm text-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-medium shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => fetchItems()}
            className="flex items-center gap-1 bg-white hover:bg-rose-100/50 border border-rose-200 text-rose-700 px-3 py-1 rounded-xl font-bold transition text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Items</div>
          <div className="text-xl font-extrabold text-slate-800 mt-1">{items.length}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Unique therapy tools</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Units</div>
          <div className="text-xl font-extrabold text-slate-800 mt-1">{totalUnits}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Physical equipment count</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Operational</div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">{operationalCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Ready for therapy sessions</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Needs Maintenance</div>
          <div className="text-xl font-extrabold text-rose-700 mt-1">{maintenanceCount}</div>
          <div className="text-[10px] text-rose-500 font-medium mt-0.5">Reported for servicing</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-premium flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment name, category, or location..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-clinic-500"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-clinic-500"
          >
            <option value="all">All Conditions</option>
            <option value="GOOD">Good (Operational)</option>
            <option value="NEED_MAINTENANCE">Needs Maintenance</option>
          </select>

          {/* Cupboard Location Filter */}
          <select
            value={cupboardFilter}
            onChange={(e) => setCupboardFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-clinic-500"
          >
            <option value="all">All Storage Cupboards</option>
            {cupboards.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Read-Only Live Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Cupboard and Location</th>
                <th className="px-6 py-4">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-clinic-700" />
                      <span>Loading live clinic inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Box className="w-8 h-8 text-slate-300" />
                      <p className="font-bold text-slate-700 text-sm">No items found</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || cupboardFilter !== 'all'
                          ? 'No inventory equipment matched your search or filter selection.'
                          : 'No inventory items are registered in the clinic database yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Folder className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.category || <span className="text-slate-300 italic">Uncategorized</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span>{item.cupboardName || item.location?.cupboardName || 'Cupboard'}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="text-clinic-700">{item.shelfName || item.location?.shelfName || 'Shelf'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold border text-[10px] inline-flex items-center gap-1 ${
                          item.status === 'GOOD'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'GOOD' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {item.status === 'GOOD' ? 'Good' : 'Needs Maintenance'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Item Count Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div>
            Showing <span className="font-bold text-slate-700">{items.length}</span> equipment items
          </div>
          <div className="text-[11px] text-slate-400">
            For storage relocations or inventory updates, please contact Clinic Administration.
          </div>
        </div>
      </div>
    </div>
  );
};
