'use client';

import React from 'react';
import { AdminInventoryView } from './AdminInventoryView';

/**
 * StorageManagementView (Legacy Prototype Wrapper)
 * Retained for backward-compatibility; delegates to live AdminInventoryView with cupboard-map view.
 */
export const StorageManagementView: React.FC = () => {
  return <AdminInventoryView initialSubView="cupboard-map" />;
};
