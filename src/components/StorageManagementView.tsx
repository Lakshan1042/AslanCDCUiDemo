import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Plus, Move, Folder, Archive, MapPin } from 'lucide-react';

export const StorageManagementView: React.FC = () => {
  const { inventory, cupboards, moveInventoryItem } = useClinic();
  const [selectedCupboardId, setSelectedCupboardId] = useState<string>('cp-1');

  // Modals state
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [targetCupboardName, setTargetCupboardName] = useState<string>('');
  const [targetShelfName, setTargetShelfName] = useState<string>('');
  
  const [isAddCupboardOpen, setIsAddCupboardOpen] = useState(false);
  const [newCupboardName, setNewCupboardName] = useState('');
  const [newCupboardDesc, setNewCupboardDesc] = useState('');

  const [isAddShelfOpen, setIsAddShelfOpen] = useState(false);
  const [newShelfName, setNewShelfName] = useState('Shelf 1');

  const selectedCupboard = cupboards.find(c => c.id === selectedCupboardId) || cupboards[0];

  const handleMoveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingItemId || !targetCupboardName || !targetShelfName) return;
    
    moveInventoryItem(movingItemId, targetCupboardName, targetShelfName);
    setMovingItemId(null);
  };

  // getItemsForShelf removed as unused (replaced by getShelfItemsByLocation below)

  // Find items that match cupboard + shelf name even if their ID isn't directly bound in the cupboards array
  // (Provides redundancy sync in local state)
  const getShelfItemsByLocation = (cupboardName: string, shelfName: string) => {
    return inventory.filter(item => item.cupboard === cupboardName && item.shelf === shelfName);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Storage & Cupboard Map</h1>
          <p className="text-slate-500 text-sm mt-0.5">Visualize where clinic occupational therapy gear is kept.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddCupboardOpen(true)}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition duration-150 shadow-sm text-xs"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Add Cupboard</span>
          </button>
        </div>
      </div>

      {/* Main visual panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Cupboards List as clickable blueprints */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Clinic Cupboards</div>
          <div className="space-y-3">
            {cupboards.map(c => {
              const isSelected = c.id === selectedCupboardId;
              const totalItems = inventory.filter(item => item.cupboard === c.name).reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCupboardId(c.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition shadow-card flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-clinic-600 bg-clinic-50/40 ring-1 ring-clinic-500'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-clinic-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Archive className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-clinic-800' : 'text-slate-800'}`}>{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="flex items-center gap-4 mt-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {c.shelves.length} Shelves
                      </span>
                      <span className="text-[10px] font-bold text-clinic-700">
                        {totalItems} items total
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Shelves structure diagram */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-premium p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-clinic-700" />
                <span>{selectedCupboard.name} Shelf Blueprint</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedCupboard.description}</p>
            </div>
            <button
              onClick={() => setIsAddShelfOpen(true)}
              className="flex items-center gap-1.5 text-xs text-clinic-700 font-bold hover:bg-clinic-50 px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shelf</span>
            </button>
          </div>

          {/* Vertical Shelves Blueprint Graphic */}
          <div className="border-4 border-amber-900/10 rounded-2xl p-4 bg-amber-50/10 space-y-4">
            {selectedCupboard.shelves.length === 0 ? (
              <div className="py-12 text-center text-slate-300 italic text-sm">
                No shelves inside this cupboard. Click "Add Shelf" to configure storage slots.
              </div>
            ) : (
              selectedCupboard.shelves.map((shelf) => {
                const shelfItems = getShelfItemsByLocation(selectedCupboard.name, shelf.name);
                return (
                  <div key={shelf.id} className="space-y-2">
                    {/* Shelf Title bar */}
                    <div className="flex items-center justify-between px-2 text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                      <span>{shelf.name}</span>
                      <span className="text-[10px] lowercase text-slate-300 font-normal">({shelfItems.length} items here)</span>
                    </div>

                    {/* Shelf Content box */}
                    <div className="bg-white border-2 border-slate-100 rounded-xl p-3 min-h-[90px] shadow-sm flex flex-wrap gap-2.5 items-center relative">
                      {shelfItems.length > 0 ? (
                        shelfItems.map(item => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                              item.status === 'Low Stock' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                              item.status === 'Maintenance Required' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                              'bg-clinic-50/30 border-clinic-100 text-clinic-900'
                            }`}
                          >
                            <Folder className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <div className="font-bold">{item.name}</div>
                              <div className="text-[9px] opacity-75 mt-0.5">Qty: {item.quantity} • {item.condition}</div>
                            </div>
                            <button
                              onClick={() => {
                                setMovingItemId(item.id);
                                setTargetCupboardName(item.cupboard);
                                setTargetShelfName(item.shelf);
                              }}
                              title="Move item to another shelf/cupboard"
                              className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-slate-700 transition"
                            >
                              <Move className="w-3 h-3" />
                            </button>
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
        </div>
      </div>

      {/* Move Item Location Modal */}
      {movingItemId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Move Inventory Item</h3>
              <button
                onClick={() => setMovingItemId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleMoveItem}>
              <div className="p-6 space-y-4">
                <div className="text-slate-600 text-sm">
                  Item: <span className="font-bold text-slate-800">{inventory.find(i => i.id === movingItemId)?.name}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Cupboard</label>
                  <select
                    value={targetCupboardName}
                    onChange={(e) => {
                      setTargetCupboardName(e.target.value);
                      // Default first shelf of target cupboard
                      const matchedCupboard = cupboards.find(c => c.name === e.target.value);
                      if (matchedCupboard && matchedCupboard.shelves.length > 0) {
                        setTargetShelfName(matchedCupboard.shelves[0].name);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500 font-medium text-slate-700"
                  >
                    {cupboards.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Shelf</label>
                  <select
                    value={targetShelfName}
                    onChange={(e) => setTargetShelfName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500 font-medium text-slate-700"
                  >
                    {cupboards.find(c => c.name === targetCupboardName)?.shelves.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    )) || <option value="">No Shelves Available</option>}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setMovingItemId(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-semibold text-xs rounded-xl transition"
                >
                  Confirm Movement
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
                className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cupboard Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cupboard D"
                  value={newCupboardName}
                  onChange={(e) => setNewCupboardName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Gym Area North Side"
                  value={newCupboardDesc}
                  onChange={(e) => setNewCupboardDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
              <button
                onClick={() => setIsAddCupboardOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCupboardName) return;
                  cupboards.push({
                    id: `cp-${cupboards.length + 1}`,
                    name: newCupboardName,
                    description: newCupboardDesc || 'Clinic Storage unit',
                    shelves: [
                      { id: `cp-${cupboards.length + 1}-s1`, name: 'Shelf 1', itemIds: [] }
                    ]
                  });
                  setIsAddCupboardOpen(false);
                  setNewCupboardName('');
                  setNewCupboardDesc('');
                }}
                className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-semibold text-xs rounded-xl transition"
              >
                Create Cupboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shelf Modal */}
      {isAddShelfOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add Shelf inside {selectedCupboard.name}</h3>
              <button
                onClick={() => setIsAddShelfOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Shelf Label</label>
                <input
                  type="text"
                  placeholder="e.g. Shelf 3"
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
              <button
                onClick={() => setIsAddShelfOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newShelfName) return;
                  selectedCupboard.shelves.push({
                    id: `${selectedCupboard.id}-s${selectedCupboard.shelves.length + 1}`,
                    name: newShelfName,
                    itemIds: []
                  });
                  setIsAddShelfOpen(false);
                  setNewShelfName(`Shelf ${selectedCupboard.shelves.length + 1}`);
                }}
                className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-semibold text-xs rounded-xl transition"
              >
                Create Shelf
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
