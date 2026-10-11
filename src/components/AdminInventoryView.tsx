'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Plus, Search, Move, Folder, Archive, MapPin,
  AlertCircle, CheckCircle2, Trash2, Edit, RefreshCw,
  Loader2, X, Box, Layers, ArrowRight, Filter
} from 'lucide-react';

export interface ApiShelf {
  id: number;
  cupboardId: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  totalQuantity: number;
}

export interface ApiCupboard {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  shelves: ApiShelf[];
  totalShelves: number;
  totalItems: number;
  totalQuantity: number;
}

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

export interface AdminInventoryViewProps {
  initialSubView?: 'registry' | 'cupboard-map';
  onSubViewChange?: (subView: 'registry' | 'cupboard-map') => void;
  onRefreshDashboardAlerts?: () => void;
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

export const AdminInventoryView: React.FC<AdminInventoryViewProps> = ({
  initialSubView = 'registry',
  onSubViewChange,
  onRefreshDashboardAlerts,
}) => {
  // Current view mode
  const [subView, setSubView] = useState<'registry' | 'cupboard-map'>(initialSubView);

  // Sync external changes to subView
  useEffect(() => {
    if (initialSubView && initialSubView !== subView) {
      setSubView(initialSubView);
    }
  }, [initialSubView, subView]);

  const handleSubViewChange = (newSubView: 'registry' | 'cupboard-map') => {
    setSubView(newSubView);
    onSubViewChange?.(newSubView);
  };

  // Data states
  const [cupboards, setCupboards] = useState<ApiCupboard[]>([]);
  const [items, setItems] = useState<ApiInventoryItem[]>([]);
  const [selectedCupboardId, setSelectedCupboardId] = useState<number | null>(null);

  // Loading & Error states
  const [isLoadingCupboards, setIsLoadingCupboards] = useState<boolean>(true);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Registry filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cupboardFilter, setCupboardFilter] = useState('all');

  // Request sequencing to prevent stale race conditions
  const itemsSeqRef = useRef<number>(0);

  // Modals state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiInventoryItem | null>(null);
  const [movingItem, setMovingItem] = useState<ApiInventoryItem | null>(null);
  const [isAddCupboardOpen, setIsAddCupboardOpen] = useState(false);
  const [isAddShelfOpen, setIsAddShelfOpen] = useState(false);

  // Delete confirmation modals
  const [deletingItem, setDeletingItem] = useState<ApiInventoryItem | null>(null);
  const [deletingShelf, setDeletingShelf] = useState<ApiShelf | null>(null);
  const [deletingCupboard, setDeletingCupboard] = useState<ApiCupboard | null>(null);

  // Form states: Add Item
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState(PRESET_CATEGORIES[0]);
  const [addQuantity, setAddQuantity] = useState<number | string>(1);
  const [addCupboardId, setAddCupboardId] = useState<number | null>(null);
  const [addShelfId, setAddShelfId] = useState<number | null>(null);
  const [addStatus, setAddStatus] = useState<'GOOD' | 'NEED_MAINTENANCE'>('GOOD');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Form states: Edit Item
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState<number | string>(1);
  const [editCupboardId, setEditCupboardId] = useState<number | null>(null);
  const [editShelfId, setEditShelfId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<'GOOD' | 'NEED_MAINTENANCE'>('GOOD');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Form states: Move Item
  const [moveTargetCupboardId, setMoveTargetCupboardId] = useState<number | null>(null);
  const [moveTargetShelfId, setMoveTargetShelfId] = useState<number | null>(null);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [moveFormError, setMoveFormError] = useState<string | null>(null);

  // Form states: Add Cupboard
  const [newCupboardName, setNewCupboardName] = useState('');
  const [newCupboardDesc, setNewCupboardDesc] = useState('');
  const [isSubmittingCupboard, setIsSubmittingCupboard] = useState(false);
  const [cupboardFormError, setCupboardFormError] = useState<string | null>(null);

  // Form states: Add Shelf
  const [newShelfName, setNewShelfName] = useState('');
  const [newShelfDesc, setNewShelfDesc] = useState('');
  const [isSubmittingShelf, setIsSubmittingShelf] = useState(false);
  const [shelfFormError, setShelfFormError] = useState<string | null>(null);

  // Form states: Deletions
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Helper to show temporary success banner
  const triggerSuccessBanner = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

  // 1. Fetch Cupboards
  const fetchCupboards = useCallback(async (preferredCupboardId?: number) => {
    setIsLoadingCupboards(true);
    try {
      const res = await fetch('/api/inventory/cupboards', {
        method: 'GET',
        credentials: 'include',
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success && Array.isArray(json.data)) {
        const fetched: ApiCupboard[] = json.data;
        setCupboards(fetched);
        setLoadError(null);

        // Select preferred or first cupboard if current selection is invalid
        setSelectedCupboardId(prev => {
          if (preferredCupboardId && fetched.some(c => c.id === preferredCupboardId)) {
            return preferredCupboardId;
          }
          if (prev && fetched.some(c => c.id === prev)) {
            return prev;
          }
          return fetched.length > 0 ? fetched[0].id : null;
        });
      } else {
        const msg = json?.message || 'Failed to load storage cupboards';
        setLoadError(msg);
      }
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to connect to storage service');
    } finally {
      setIsLoadingCupboards(false);
    }
  }, []);

  // 2. Fetch Items with filters & race-condition cancellation
  const fetchItems = useCallback(async () => {
    const seq = ++itemsSeqRef.current;
    setIsLoadingItems(true);

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

      // Discard stale responses if a newer request was dispatched
      if (seq !== itemsSeqRef.current) return;

      if (res.ok && json?.success && Array.isArray(json.data)) {
        setItems(json.data.map(normalizeApiItem));
        setLoadError(null);
      } else {
        setLoadError(json?.message || 'Failed to load inventory items');
      }
    } catch (err: any) {
      if (seq === itemsSeqRef.current) {
        setLoadError(err?.message || 'Failed to connect to inventory items service');
      }
    } finally {
      if (seq === itemsSeqRef.current) {
        setIsLoadingItems(false);
      }
    }
  }, [searchTerm, categoryFilter, statusFilter, cupboardFilter]);

  // Initial load
  useEffect(() => {
    fetchCupboards();
  }, [fetchCupboards]);

  // Trigger items fetch on filter or search updates
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Refresh all data and notify parent
  const refreshAll = useCallback(async (preferredCupboardId?: number) => {
    await Promise.all([
      fetchCupboards(preferredCupboardId),
      fetchItems(),
    ]);
    onRefreshDashboardAlerts?.();
  }, [fetchCupboards, fetchItems, onRefreshDashboardAlerts]);

  // Selected cupboard object
  const selectedCupboard = useMemo(() => {
    if (!cupboards.length) return null;
    return cupboards.find(c => c.id === selectedCupboardId) || cupboards[0];
  }, [cupboards, selectedCupboardId]);

  // Unique categories derived from live items and presets
  const availableCategories = useMemo(() => {
    const cats = new Set<string>(PRESET_CATEGORIES);
    for (const item of items) {
      if (item.category) cats.add(item.category);
    }
    return Array.from(cats);
  }, [items]);

  // -------------------------------------------------------------
  // Add Item Handlers
  // -------------------------------------------------------------
  const handleOpenAddItem = () => {
    setAddFormError(null);
    setAddName('');
    setAddCategory(PRESET_CATEGORIES[0]);
    setAddQuantity(1);
    setAddStatus('GOOD');

    // Default cupboard and shelf
    const defaultCupboard = cupboards.length > 0 ? cupboards[0] : null;
    if (defaultCupboard) {
      setAddCupboardId(defaultCupboard.id);
      setAddShelfId(defaultCupboard.shelves.length > 0 ? defaultCupboard.shelves[0].id : null);
    } else {
      setAddCupboardId(null);
      setAddShelfId(null);
    }

    setIsAddItemOpen(true);
  };

  const handleAddCupboardSelectChange = (newCId: number) => {
    setAddCupboardId(newCId);
    const cup = cupboards.find(c => c.id === newCId);
    if (cup && cup.shelves.length > 0) {
      setAddShelfId(cup.shelves[0].id);
    } else {
      setAddShelfId(null);
    }
  };

  const handleSubmitAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!addName.trim()) {
      setAddFormError('Please enter an item name.');
      return;
    }

    const numQty = typeof addQuantity === 'number' ? addQuantity : parseInt(String(addQuantity), 10);
    if (isNaN(numQty) || numQty < 0 || !Number.isInteger(numQty)) {
      setAddFormError('Quantity must be a valid non-negative whole integer (0 or greater).');
      return;
    }

    if (!addCupboardId || !addShelfId) {
      setAddFormError('Please select both a valid Cupboard and Shelf. If no shelf exists, add one first.');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await fetch('/api/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: addName.trim(),
          category: addCategory.trim(),
          quantity: numQty,
          cupboardId: addCupboardId,
          shelfId: addShelfId,
          status: addStatus,
        }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setIsAddItemOpen(false);
        triggerSuccessBanner(`Item "${addName.trim()}" added to inventory successfully.`);
        await refreshAll(addCupboardId);
      } else {
        setAddFormError(json?.message || 'Failed to create inventory item.');
      }
    } catch (err: any) {
      setAddFormError(err?.message || 'Network error while creating item.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // -------------------------------------------------------------
  // Edit Item Handlers
  // -------------------------------------------------------------
  const handleOpenEditItem = (item: ApiInventoryItem) => {
    setEditingItem(item);
    setEditFormError(null);
    setEditName(item.name);
    setEditCategory(item.category || PRESET_CATEGORIES[0]);
    setEditQuantity(item.quantity);
    setEditStatus(item.status);
    setEditCupboardId(item.cupboardId ?? item.location?.cupboardId ?? null);
    setEditShelfId(item.shelfId ?? item.location?.shelfId ?? null);
  };

  const handleEditCupboardSelectChange = (newCId: number) => {
    setEditCupboardId(newCId);
    const cup = cupboards.find(c => c.id === newCId);
    if (cup && cup.shelves.length > 0) {
      // If the current shelf is already in the new cupboard, keep it, otherwise pick the first
      const shelfStillValid = cup.shelves.some(s => s.id === editShelfId);
      if (!shelfStillValid) {
        setEditShelfId(cup.shelves[0].id);
      }
    } else {
      setEditShelfId(null);
    }
  };

  const handleSubmitEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditFormError(null);

    if (!editName.trim()) {
      setEditFormError('Please enter an item name.');
      return;
    }

    const numQty = typeof editQuantity === 'number' ? editQuantity : parseInt(String(editQuantity), 10);
    if (isNaN(numQty) || numQty < 0 || !Number.isInteger(numQty)) {
      setEditFormError('Quantity must be a valid non-negative whole integer (0 or greater).');
      return;
    }

    if (!editCupboardId || !editShelfId) {
      setEditFormError('Please select both a valid Cupboard and Shelf.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/inventory/items/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editName.trim(),
          category: editCategory.trim(),
          quantity: numQty,
          cupboardId: editCupboardId,
          shelfId: editShelfId,
          status: editStatus,
        }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setEditingItem(null);
        triggerSuccessBanner(`Item "${editName.trim()}" updated successfully.`);
        await refreshAll(editCupboardId);
      } else {
        setEditFormError(json?.message || 'Failed to update inventory item.');
      }
    } catch (err: any) {
      setEditFormError(err?.message || 'Network error while updating item.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // -------------------------------------------------------------
  // Move Item Handlers
  // -------------------------------------------------------------
  const handleOpenMoveItem = (item: ApiInventoryItem) => {
    setMovingItem(item);
    setMoveFormError(null);
    setMoveTargetCupboardId(item.cupboardId ?? item.location?.cupboardId ?? null);
    setMoveTargetShelfId(item.shelfId ?? item.location?.shelfId ?? null);
  };

  const handleMoveCupboardChange = (newCId: number) => {
    setMoveTargetCupboardId(newCId);
    const cup = cupboards.find(c => c.id === newCId);
    if (cup && cup.shelves.length > 0) {
      setMoveTargetShelfId(cup.shelves[0].id);
    } else {
      setMoveTargetShelfId(null);
    }
  };

  const handleSubmitMoveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingItem) return;
    setMoveFormError(null);

    if (!moveTargetCupboardId || !moveTargetShelfId) {
      setMoveFormError('Please select a target Cupboard and Shelf.');
      return;
    }

    setIsSubmittingMove(true);
    try {
      const res = await fetch(`/api/inventory/items/${movingItem.id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetShelfId: moveTargetShelfId,
          targetCupboardId: moveTargetCupboardId,
        }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        const targetCupboard = cupboards.find(c => c.id === moveTargetCupboardId);
        const targetShelf = targetCupboard?.shelves.find(s => s.id === moveTargetShelfId);
        triggerSuccessBanner(
          `Item "${movingItem.name}" relocated to ${targetCupboard?.name || 'Cupboard'} → ${targetShelf?.name || 'Shelf'}.`
        );
        setMovingItem(null);
        await refreshAll(moveTargetCupboardId);
      } else {
        setMoveFormError(json?.message || 'Failed to move inventory item.');
      }
    } catch (err: any) {
      setMoveFormError(err?.message || 'Network error while moving item.');
    } finally {
      setIsSubmittingMove(false);
    }
  };

  // -------------------------------------------------------------
  // Add Cupboard Handlers
  // -------------------------------------------------------------
  const handleOpenAddCupboard = () => {
    setNewCupboardName('');
    setNewCupboardDesc('');
    setCupboardFormError(null);
    setIsAddCupboardOpen(true);
  };

  const handleSubmitAddCupboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCupboardFormError(null);

    if (!newCupboardName.trim()) {
      setCupboardFormError('Cupboard name is required.');
      return;
    }

    setIsSubmittingCupboard(true);
    try {
      const res = await fetch('/api/inventory/cupboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newCupboardName.trim(),
          description: newCupboardDesc.trim() || undefined,
        }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json.data) {
        const created: ApiCupboard = json.data;
        setIsAddCupboardOpen(false);
        triggerSuccessBanner(`Cupboard "${created.name}" created successfully.`);
        await refreshAll(created.id);
      } else {
        setCupboardFormError(json?.message || 'Failed to create cupboard.');
      }
    } catch (err: any) {
      setCupboardFormError(err?.message || 'Network error creating cupboard.');
    } finally {
      setIsSubmittingCupboard(false);
    }
  };

  // -------------------------------------------------------------
  // Add Shelf Handlers
  // -------------------------------------------------------------
  const handleOpenAddShelf = () => {
    if (!selectedCupboard) {
      triggerSuccessBanner('Please select or create a cupboard first.');
      return;
    }
    const nextShelfNum = (selectedCupboard.shelves?.length || 0) + 1;
    setNewShelfName(`Shelf ${nextShelfNum}`);
    setNewShelfDesc('');
    setShelfFormError(null);
    setIsAddShelfOpen(true);
  };

  const handleSubmitAddShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCupboard) return;
    setShelfFormError(null);

    if (!newShelfName.trim()) {
      setShelfFormError('Shelf name is required.');
      return;
    }

    setIsSubmittingShelf(true);
    try {
      const res = await fetch(`/api/inventory/cupboards/${selectedCupboard.id}/shelves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newShelfName.trim(),
          description: newShelfDesc.trim() || undefined,
        }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setIsAddShelfOpen(false);
        triggerSuccessBanner(`Shelf "${newShelfName.trim()}" added to ${selectedCupboard.name}.`);
        await refreshAll(selectedCupboard.id);
      } else {
        setShelfFormError(json?.message || 'Failed to add shelf.');
      }
    } catch (err: any) {
      setShelfFormError(err?.message || 'Network error adding shelf.');
    } finally {
      setIsSubmittingShelf(false);
    }
  };

  // -------------------------------------------------------------
  // Delete Handlers
  // -------------------------------------------------------------
  const handleConfirmDeleteItem = async () => {
    if (!deletingItem) return;
    setIsSubmittingDelete(true);
    setDeleteErrorMessage(null);

    try {
      const res = await fetch(`/api/inventory/items/${deletingItem.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        triggerSuccessBanner(`Item "${deletingItem.name}" deleted.`);
        const affectedCupboardId = deletingItem.cupboardId ?? deletingItem.location?.cupboardId;
        setDeletingItem(null);
        await refreshAll(affectedCupboardId);
      } else {
        setDeleteErrorMessage(json?.message || 'Failed to delete item.');
      }
    } catch (err: any) {
      setDeleteErrorMessage(err?.message || 'Network error deleting item.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleConfirmDeleteShelf = async () => {
    if (!deletingShelf) return;
    setIsSubmittingDelete(true);
    setDeleteErrorMessage(null);

    try {
      const res = await fetch(`/api/inventory/shelves/${deletingShelf.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        triggerSuccessBanner(`Shelf "${deletingShelf.name}" deleted.`);
        const parentCupboardId = deletingShelf.cupboardId;
        setDeletingShelf(null);
        await refreshAll(parentCupboardId);
      } else {
        // Backend protection: 409 SHELF_NOT_EMPTY
        setDeleteErrorMessage(
          json?.message ||
          'Cannot delete shelf because it still contains inventory items. Move or delete them first.'
        );
      }
    } catch (err: any) {
      setDeleteErrorMessage(err?.message || 'Network error deleting shelf.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleConfirmDeleteCupboard = async () => {
    if (!deletingCupboard) return;
    setIsSubmittingDelete(true);
    setDeleteErrorMessage(null);

    try {
      const res = await fetch(`/api/inventory/cupboards/${deletingCupboard.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        triggerSuccessBanner(`Cupboard "${deletingCupboard.name}" deleted.`);
        setDeletingCupboard(null);
        await refreshAll();
      } else {
        // Backend protection: 409 CUPBOARD_NOT_EMPTY
        setDeleteErrorMessage(
          json?.message ||
          'Cannot delete cupboard because it contains shelves or stored items. Remove all shelves first.'
        );
      }
    } catch (err: any) {
      setDeleteErrorMessage(err?.message || 'Network error deleting cupboard.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Find items located on a specific shelf
  const getItemsForShelf = (shelfId: number) => {
    return items.filter(item => item.shelfId === shelfId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification / Success Banner */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-500 hover:text-emerald-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {loadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-medium shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-1 bg-white hover:bg-rose-100/50 border border-rose-200 text-rose-700 px-3 py-1 rounded-xl font-bold transition text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. REGISTRY VIEW */}
      {/* ------------------------------------------------------------- */}
      {subView === 'registry' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory Registry</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Track location, availability, and condition of clinic therapy gear with live database sync.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshAll()}
                title="Refresh Live Data"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold p-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center justify-center"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoadingItems || isLoadingCupboards ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => handleSubViewChange('cupboard-map')}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Archive className="w-4 h-4 text-slate-500" />
                <span>Cupboard Map</span>
              </button>
              <button
                onClick={handleOpenAddItem}
                className="bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
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
                placeholder="Search items by name or category..."
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

              {/* Status / Condition Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-clinic-500"
              >
                <option value="all">All Conditions</option>
                <option value="GOOD">Good Condition</option>
                <option value="NEED_MAINTENANCE">Needs Maintenance</option>
              </select>

              {/* Cupboard Location Filter */}
              <select
                value={cupboardFilter}
                onChange={(e) => setCupboardFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-clinic-500"
              >
                <option value="all">All Cupboards</option>
                {cupboards.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Registry Table */}
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
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {isLoadingItems ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-clinic-700" />
                          <span>Loading live inventory records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <Box className="w-8 h-8 text-slate-300" />
                          <p className="font-bold text-slate-700 text-sm">No items found</p>
                          <p className="text-xs text-slate-400">
                            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || cupboardFilter !== 'all'
                              ? 'No inventory items matched your active search or filters.'
                              : 'No inventory items are registered in the system yet.'}
                          </p>
                          <button
                            onClick={handleOpenAddItem}
                            className="mt-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                          >
                            Add New Item
                          </button>
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
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              title="Edit item details"
                              className="text-clinic-700 hover:text-clinic-900 font-bold hover:bg-clinic-50 p-1.5 rounded-lg transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenMoveItem(item)}
                              title="Relocate item to another shelf"
                              className="text-amber-600 hover:text-amber-800 font-bold hover:bg-amber-50 p-1.5 rounded-lg transition"
                            >
                              <Move className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingItem(item);
                                setDeleteErrorMessage(null);
                              }}
                              title="Delete item"
                              className="text-rose-500 hover:text-rose-700 font-bold hover:bg-rose-50 p-1.5 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Summary Counts */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div>
                Showing <span className="font-bold text-slate-700">{items.length}</span> live items
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Total Units:{' '}
                  <span className="font-bold text-slate-700">
                    {items.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                </span>
                <span>
                  Maintenance Alerts:{' '}
                  <span className="font-bold text-rose-600">
                    {items.filter(i => i.status === 'NEED_MAINTENANCE').length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CUPBOARD MAP AND SHELF BLUEPRINT VIEW */}
      {/* ------------------------------------------------------------- */}
      {subView === 'cupboard-map' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Storage & Cupboard Map</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Visualize where clinic occupational therapy gear is kept and manage shelf storage slots.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubViewChange('registry')}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Back to Registry
              </button>
              <button
                onClick={handleOpenAddCupboard}
                className="bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Cupboard</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Side: Cupboards List as blueprints */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinic Cupboards</span>
                <span className="text-[10px] font-bold text-slate-400">{cupboards.length} Total</span>
              </div>

              {isLoadingCupboards ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-premium">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-clinic-700 mb-2" />
                  <span className="text-xs">Loading storage units...</span>
                </div>
              ) : cupboards.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-premium">
                  <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No cupboards created</p>
                  <p className="text-[11px] text-slate-400 mt-1">Create your first cupboard to start organizing storage.</p>
                  <button
                    onClick={handleOpenAddCupboard}
                    className="mt-3 px-3 py-1.5 bg-clinic-700 text-white text-xs font-bold rounded-xl"
                  >
                    Add Cupboard
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cupboards.map(c => {
                    const isSelected = c.id === selectedCupboardId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCupboardId(c.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition shadow-card flex items-start gap-3.5 relative group ${
                          isSelected
                            ? 'border-clinic-600 bg-clinic-50/40 ring-1 ring-clinic-500'
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className={`p-3 rounded-xl flex-shrink-0 ${isSelected ? 'bg-clinic-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Archive className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-clinic-800' : 'text-slate-800'}`}>
                              {c.name}
                            </h3>
                            {/* Delete Cupboard Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingCupboard(c);
                                setDeleteErrorMessage(null);
                              }}
                              title="Delete cupboard"
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {c.description || 'Clinic Storage Unit'}
                          </p>
                          <div className="flex items-center gap-3 mt-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {c.shelves?.length || 0} {c.shelves?.length === 1 ? 'Shelf' : 'Shelves'}
                            </span>
                            <span className="text-[10px] font-bold text-clinic-700">
                              {c.totalQuantity || 0} units stored
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Side: Shelves structure blueprint */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-premium p-6">
              {selectedCupboard ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div>
                      <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-clinic-700" />
                        <span>{selectedCupboard.name} Shelf Blueprint</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedCupboard.description || 'Configured storage layout'}
                      </p>
                    </div>
                    <button
                      onClick={handleOpenAddShelf}
                      className="flex items-center gap-1.5 text-xs text-clinic-700 font-bold hover:bg-clinic-50 px-3 py-2 rounded-xl border border-clinic-200 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Shelf</span>
                    </button>
                  </div>

                  {/* Vertical Shelves Blueprint Graphic */}
                  <div className="border-4 border-amber-900/10 rounded-2xl p-4 bg-amber-50/10 space-y-4">
                    {!selectedCupboard.shelves || selectedCupboard.shelves.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 italic text-xs">
                        No shelves inside this cupboard. Click "Add Shelf" to configure storage slots.
                      </div>
                    ) : (
                      selectedCupboard.shelves.map(shelf => {
                        const shelfItems = getItemsForShelf(shelf.id);
                        return (
                          <div key={shelf.id} className="space-y-2">
                            {/* Shelf Title bar */}
                            <div className="flex items-center justify-between px-2 text-xs font-extrabold text-slate-600 uppercase tracking-wide">
                              <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-slate-400" />
                                <span>{shelf.name}</span>
                                <span className="text-[10px] lowercase text-slate-400 font-normal">
                                  ({shelfItems.length} {shelfItems.length === 1 ? 'item' : 'items'} •{' '}
                                  {shelfItems.reduce((acc, i) => acc + i.quantity, 0)} units)
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setDeletingShelf(shelf);
                                  setDeleteErrorMessage(null);
                                }}
                                title="Delete shelf"
                                className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Shelf Content box */}
                            <div className="bg-white border-2 border-slate-100 rounded-xl p-3 min-h-[90px] shadow-sm flex flex-wrap gap-2.5 items-center relative">
                              {shelfItems.length > 0 ? (
                                shelfItems.map(item => (
                                  <div
                                    key={item.id}
                                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition ${
                                      item.status === 'NEED_MAINTENANCE'
                                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                                        : 'bg-clinic-50/40 border-clinic-100 text-slate-800'
                                    }`}
                                  >
                                    <Folder className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                    <div>
                                      <div className="font-bold">{item.name}</div>
                                      <div className="text-[9px] opacity-75 mt-0.5">
                                        Qty: {item.quantity} • {item.status === 'GOOD' ? 'Good' : 'Needs Maintenance'}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200">
                                      <button
                                        onClick={() => handleOpenMoveItem(item)}
                                        title="Move item to another shelf or cupboard"
                                        className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-slate-700 transition"
                                      >
                                        <Move className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleOpenEditItem(item)}
                                        title="Edit item"
                                        className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-slate-700 transition"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-slate-300 text-xs italic py-4 w-full text-center">
                                  Empty Shelf
                                </div>
                              )}
                            </div>

                            {/* Visual wooden shelf plank */}
                            <div className="h-2.5 bg-amber-800/80 rounded-full shadow-sm" />
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">
                  Select a cupboard to inspect its blueprint.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add Inventory Item</h3>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitAddItem}>
              <div className="p-6 space-y-4 text-xs">
                {addFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{addFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Item Name *</label>
                  <input
                    required
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                    placeholder="e.g. Weighted Vest (Child Medium)"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  >
                    {availableCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Quantity *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={addQuantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddQuantity(val === '' ? '' : parseInt(val, 10));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Cupboard *</label>
                    <select
                      value={addCupboardId || ''}
                      onChange={(e) => handleAddCupboardSelectChange(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                    >
                      {cupboards.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Shelf *</label>
                    <select
                      value={addShelfId || ''}
                      onChange={(e) => setAddShelfId(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                    >
                      {cupboards.find(c => c.id === addCupboardId)?.shelves.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      )) || <option value="">No Shelves</option>}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Condition *</label>
                  <select
                    value={addStatus}
                    onChange={(e: any) => setAddStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  >
                    <option value="GOOD">Good (Operational)</option>
                    <option value="NEED_MAINTENANCE">Need Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd || !addShelfId}
                  className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmittingAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Edit Inventory Item</h3>
                <p className="text-[10px] text-slate-400">Database Record ID: #{editingItem.id}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitEditItem}>
              <div className="p-6 space-y-4 text-xs">
                {editFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{editFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Item Name *</label>
                  <input
                    required
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                    placeholder="Category"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Quantity *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={editQuantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditQuantity(val === '' ? '' : parseInt(val, 10));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Cupboard *</label>
                    <select
                      value={editCupboardId || ''}
                      onChange={(e) => handleEditCupboardSelectChange(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                    >
                      {cupboards.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Shelf *</label>
                    <select
                      value={editShelfId || ''}
                      onChange={(e) => setEditShelfId(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                    >
                      {cupboards.find(c => c.id === editCupboardId)?.shelves.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      )) || <option value="">No Shelves</option>}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Condition *</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  >
                    <option value="GOOD">Good (Operational)</option>
                    <option value="NEED_MAINTENANCE">Need Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit || !editShelfId}
                  className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Item Location Modal */}
      {movingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Move Inventory Item</h3>
                <p className="text-xs text-slate-400">Reassign physical shelf storage location</p>
              </div>
              <button
                onClick={() => setMovingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitMoveItem}>
              <div className="p-6 space-y-4 text-xs">
                {moveFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{moveFormError}</span>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">Selected Item:</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{movingItem.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Current Location: <span className="font-bold text-slate-600">{movingItem.cupboardName || movingItem.location?.cupboardName} → {movingItem.shelfName || movingItem.location?.shelfName}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Target Cupboard *</label>
                  <select
                    value={moveTargetCupboardId || ''}
                    onChange={(e) => handleMoveCupboardChange(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  >
                    {cupboards.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Target Shelf *</label>
                  <select
                    value={moveTargetShelfId || ''}
                    onChange={(e) => setMoveTargetShelfId(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  >
                    {cupboards.find(c => c.id === moveTargetCupboardId)?.shelves.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    )) || <option value="">No Shelves Available</option>}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setMovingItem(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMove || !moveTargetShelfId}
                  className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmittingMove && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Movement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cupboard Modal */}
      {isAddCupboardOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add Storage Cupboard</h3>
              <button
                onClick={() => setIsAddCupboardOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitAddCupboard}>
              <div className="p-6 space-y-4 text-xs">
                {cupboardFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{cupboardFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Cupboard Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Cupboard C"
                    value={newCupboardName}
                    onChange={(e) => setNewCupboardName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Description / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. North Sensory Gym Storage"
                    value={newCupboardDesc}
                    onChange={(e) => setNewCupboardDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddCupboardOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCupboard}
                  className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmittingCupboard && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Cupboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shelf Modal */}
      {isAddShelfOpen && selectedCupboard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Add Shelf</h3>
                <p className="text-xs text-slate-400">Inside {selectedCupboard.name}</p>
              </div>
              <button
                onClick={() => setIsAddShelfOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitAddShelf}>
              <div className="p-6 space-y-4 text-xs">
                {shelfFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{shelfFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Shelf Name / Designation *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Shelf 3"
                    value={newShelfName}
                    onChange={(e) => setNewShelfName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Top tier for balance balls"
                    value={newShelfDesc}
                    onChange={(e) => setNewShelfDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-clinic-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddShelfOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShelf}
                  className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmittingShelf && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Shelf</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Delete Item Confirmation</h3>
              <button
                onClick={() => setDeletingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              {deleteErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{deleteErrorMessage}</span>
                </div>
              )}
              <p className="text-slate-600">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingItem.name}"</span>?
                This action is permanent and cannot be undone.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                Location: {deletingItem.cupboardName || deletingItem.location?.cupboardName} → {deletingItem.shelfName || deletingItem.location?.shelfName} ({deletingItem.quantity} units)
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteItem}
                disabled={isSubmittingDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isSubmittingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Shelf Confirmation Modal */}
      {deletingShelf && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Delete Shelf Confirmation</h3>
              <button
                onClick={() => setDeletingShelf(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              {deleteErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{deleteErrorMessage}</span>
                </div>
              )}
              <p className="text-slate-600">
                Are you sure you want to remove shelf <span className="font-bold text-slate-800">"{deletingShelf.name}"</span>?
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px]">
                Note: Shelves containing stored inventory items cannot be deleted until all items are relocated or removed.
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
              <button
                onClick={() => setDeletingShelf(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteShelf}
                disabled={isSubmittingDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isSubmittingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Shelf</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Cupboard Confirmation Modal */}
      {deletingCupboard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Delete Cupboard Confirmation</h3>
              <button
                onClick={() => setDeletingCupboard(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              {deleteErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{deleteErrorMessage}</span>
                </div>
              )}
              <p className="text-slate-600">
                Are you sure you want to remove cupboard <span className="font-bold text-slate-800">"{deletingCupboard.name}"</span>?
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px]">
                Note: Cupboards that contain configured shelves or inventory gear cannot be deleted until all contents have been removed.
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
              <button
                onClick={() => setDeletingCupboard(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCupboard}
                disabled={isSubmittingDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isSubmittingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Cupboard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
