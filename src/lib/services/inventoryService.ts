/**
 * Inventory & Storage Management Service
 *
 * Core domain service for clinic inventory management:
 * - Cupboard & Shelf storage hierarchy management
 * - Inventory item tracking (quantity, category, location, and condition status)
 * - Safe item relocation across shelves/cupboards
 * - Data integrity guards preventing accidental deletion of populated storage locations
 */

import { prisma } from "../prisma";
import { InventoryStatus } from "../../generated/prisma/enums";
import type { Prisma } from "../../generated/prisma/client";

// ─── Custom Domain Errors ───────────────────────────────────────────────────

export class InventoryValidationError extends Error {
  statusCode = 400;
  code: string;

  constructor(message: string, code = "INVALID_INPUT") {
    super(message);
    this.name = "InventoryValidationError";
    this.code = code;
  }
}

export class InventoryNotFoundError extends Error {
  statusCode = 404;
  code = "NOT_FOUND";

  constructor(message: string) {
    super(message);
    this.name = "InventoryNotFoundError";
  }
}

export class InventoryConflictError extends Error {
  statusCode = 409;
  code: string;

  constructor(message: string, code = "DUPLICATE_NAME") {
    super(message);
    this.name = "InventoryConflictError";
    this.code = code;
  }
}

export class InventoryDependencyError extends Error {
  statusCode = 400;
  code = "DEPENDENCIES_EXIST";

  constructor(message: string) {
    super(message);
    this.name = "InventoryDependencyError";
  }
}

// ─── Type Definitions ───────────────────────────────────────────────────────

export interface CupboardSummary {
  id: number;
  name: string;
  description: string | null;
  shelfCount: number;
  itemCount: number;
  totalQuantity: number;
  createdAt: Date;
  updatedAt: Date;
  shelves: ShelfSummary[];
}

export interface ShelfSummary {
  id: number;
  cupboardId: number;
  name: string;
  description: string | null;
  itemCount: number;
  totalQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemDetails {
  id: number;
  name: string;
  category: string | null;
  quantity: number;
  status: InventoryStatus;
  shelfId: number;
  shelfName: string;
  cupboardId: number;
  cupboardName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCupboardInput {
  name: string;
  description?: string | null;
}

export interface UpdateCupboardInput {
  name?: string;
  description?: string | null;
}

export interface CreateShelfInput {
  cupboardId: number;
  name: string;
  description?: string | null;
}

export interface UpdateShelfInput {
  name?: string;
  description?: string | null;
  cupboardId?: number;
}

export interface CreateInventoryItemInput {
  name: string;
  category?: string | null;
  quantity: number;
  shelfId: number;
  cupboardId?: number;
  status?: InventoryStatus;
}

export interface UpdateInventoryItemInput {
  name?: string;
  category?: string | null;
  quantity?: number;
  shelfId?: number;
  cupboardId?: number;
  status?: InventoryStatus;
}

export interface InventoryItemFilters {
  searchTerm?: string;
  category?: string;
  status?: InventoryStatus;
  cupboardId?: number;
  shelfId?: number;
}

// ─── Helper Validators ──────────────────────────────────────────────────────

function parsePositiveInt(val: unknown, fieldName: string): number {
  const num = typeof val === "number" ? val : parseInt(String(val), 10);
  if (!Number.isInteger(num) || num <= 0) {
    throw new InventoryValidationError(
      `${fieldName} must be a valid positive integer`,
      "INVALID_ID"
    );
  }
  return num;
}

function parseQuantity(val: unknown): number {
  const num = typeof val === "number" ? val : Number(val);
  if (!Number.isInteger(num) || num < 0) {
    throw new InventoryValidationError(
      "Quantity must be a non-negative integer (0 or greater)",
      "INVALID_QUANTITY"
    );
  }
  return num;
}

function validateStatus(status: unknown): InventoryStatus {
  if (status === InventoryStatus.GOOD || status === "Good" || status === "GOOD") {
    return InventoryStatus.GOOD;
  }
  if (
    status === InventoryStatus.NEED_MAINTENANCE ||
    status === "Need Maintenance" ||
    status === "NEED_MAINTENANCE"
  ) {
    return InventoryStatus.NEED_MAINTENANCE;
  }
  throw new InventoryValidationError(
    "Invalid inventory status. Status must be GOOD or NEED_MAINTENANCE",
    "INVALID_STATUS"
  );
}

// ─── Cupboards Service ──────────────────────────────────────────────────────

/**
 * Lists all cupboards with nested shelves, shelf item counts, and cupboard total quantities.
 */
export async function listCupboardsWithShelves(): Promise<CupboardSummary[]> {
  const cupboards = await prisma.cupboard.findMany({
    orderBy: { name: "asc" },
    include: {
      shelves: {
        orderBy: { name: "asc" },
        include: {
          items: {
            select: {
              quantity: true,
            },
          },
        },
      },
    },
  });

  return cupboards.map((c) => {
    let cupboardItemCount = 0;
    let cupboardTotalQuantity = 0;

    const shelvesSummary: ShelfSummary[] = c.shelves.map((s) => {
      const shelfItemCount = s.items.length;
      const shelfTotalQuantity = s.items.reduce((sum, item) => sum + item.quantity, 0);

      cupboardItemCount += shelfItemCount;
      cupboardTotalQuantity += shelfTotalQuantity;

      return {
        id: s.id,
        cupboardId: s.cupboardId,
        name: s.name,
        description: s.description,
        itemCount: shelfItemCount,
        totalQuantity: shelfTotalQuantity,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

    return {
      id: c.id,
      name: c.name,
      description: c.description,
      shelfCount: shelvesSummary.length,
      itemCount: cupboardItemCount,
      totalQuantity: cupboardTotalQuantity,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      shelves: shelvesSummary,
    };
  });
}

/**
 * Retrieves a single cupboard by ID with its shelves and summary statistics.
 */
export async function getCupboardById(id: number): Promise<CupboardSummary> {
  const cupboardId = parsePositiveInt(id, "cupboardId");

  const c = await prisma.cupboard.findUnique({
    where: { id: cupboardId },
    include: {
      shelves: {
        orderBy: { name: "asc" },
        include: {
          items: {
            select: {
              quantity: true,
            },
          },
        },
      },
    },
  });

  if (!c) {
    throw new InventoryNotFoundError(`Cupboard with ID ${cupboardId} was not found`);
  }

  let cupboardItemCount = 0;
  let cupboardTotalQuantity = 0;

  const shelvesSummary: ShelfSummary[] = c.shelves.map((s) => {
    const shelfItemCount = s.items.length;
    const shelfTotalQuantity = s.items.reduce((sum, item) => sum + item.quantity, 0);

    cupboardItemCount += shelfItemCount;
    cupboardTotalQuantity += shelfTotalQuantity;

    return {
      id: s.id,
      cupboardId: s.cupboardId,
      name: s.name,
      description: s.description,
      itemCount: shelfItemCount,
      totalQuantity: shelfTotalQuantity,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  });

  return {
    id: c.id,
    name: c.name,
    description: c.description,
    shelfCount: shelvesSummary.length,
    itemCount: cupboardItemCount,
    totalQuantity: cupboardTotalQuantity,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    shelves: shelvesSummary,
  };
}

/**
 * Creates a new storage cupboard. Enforces unique cupboard name.
 */
export async function createCupboard(data: CreateCupboardInput) {
  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    throw new InventoryValidationError("Cupboard name is required", "NAME_REQUIRED");
  }
  if (trimmedName.length > 100) {
    throw new InventoryValidationError("Cupboard name cannot exceed 100 characters", "NAME_TOO_LONG");
  }

  const existing = await prisma.cupboard.findUnique({
    where: { name: trimmedName },
  });
  if (existing) {
    throw new InventoryConflictError(
      `A storage cupboard named "${trimmedName}" already exists`,
      "CUPBOARD_NAME_EXISTS"
    );
  }

  try {
    return await prisma.cupboard.create({
      data: {
        name: trimmedName,
        description: data.description?.trim() || null,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new InventoryConflictError(
        `A storage cupboard named "${trimmedName}" already exists`,
        "CUPBOARD_NAME_EXISTS"
      );
    }
    throw error;
  }
}

/**
 * Updates an existing cupboard's name or description.
 */
export async function updateCupboard(id: number, data: UpdateCupboardInput) {
  const cupboardId = parsePositiveInt(id, "cupboardId");

  const existing = await prisma.cupboard.findUnique({
    where: { id: cupboardId },
  });
  if (!existing) {
    throw new InventoryNotFoundError(`Cupboard with ID ${cupboardId} was not found`);
  }

  const updateData: Prisma.CupboardUpdateInput = {};

  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new InventoryValidationError("Cupboard name cannot be empty", "NAME_REQUIRED");
    }
    if (trimmedName.length > 100) {
      throw new InventoryValidationError("Cupboard name cannot exceed 100 characters", "NAME_TOO_LONG");
    }

    if (trimmedName !== existing.name) {
      const duplicate = await prisma.cupboard.findUnique({
        where: { name: trimmedName },
      });
      if (duplicate && duplicate.id !== cupboardId) {
        throw new InventoryConflictError(
          `A storage cupboard named "${trimmedName}" already exists`,
          "CUPBOARD_NAME_EXISTS"
        );
      }
      updateData.name = trimmedName;
    }
  }

  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || null;
  }

  try {
    return await prisma.cupboard.update({
      where: { id: cupboardId },
      data: updateData,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new InventoryConflictError(
        `A storage cupboard with this name already exists`,
        "CUPBOARD_NAME_EXISTS"
      );
    }
    if (error?.code === "P2025") {
      throw new InventoryNotFoundError(`Cupboard with ID ${cupboardId} was not found`);
    }
    throw error;
  }
}

/**
 * Deletes a cupboard only if it contains no shelves and no inventory items.
 * Uses pessimistic row locking to prevent race conditions with concurrent shelf creation.
 * Never cascade-deletes existing storage locations or inventory items.
 */
export async function deleteCupboard(id: number) {
  const cupboardId = parsePositiveInt(id, "cupboardId");

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock the cupboard row to serialize against concurrent shelf creation/deletion
      const lockedCupboards: Array<{ id: number; name: string }> = await tx.$queryRaw`
        SELECT id, name FROM cupboards WHERE id = ${cupboardId} FOR UPDATE
      `;

      if (!lockedCupboards || lockedCupboards.length === 0) {
        throw new InventoryNotFoundError(`Cupboard with ID ${cupboardId} was not found`);
      }

      const cupboard = lockedCupboards[0];

      // 2. Lock and check if any shelves exist under this cupboard
      const shelfCountResult: Array<{ count: bigint | number }> = await tx.$queryRaw`
        SELECT COUNT(*) as count FROM shelves WHERE cupboard_id = ${cupboardId} FOR UPDATE
      `;
      const shelfCount = Number(shelfCountResult[0]?.count ?? 0);

      if (shelfCount > 0) {
        throw new InventoryDependencyError(
          `Cannot delete cupboard "${cupboard.name}" because it contains ${shelfCount} shelf location(s). Empty or remove the shelves before deleting the cupboard.`
        );
      }

      // 3. Delete cupboard safely
      await tx.cupboard.delete({
        where: { id: cupboardId },
      });

      return { success: true, id: cupboardId };
    });
  } catch (error: any) {
    if (
      error instanceof InventoryNotFoundError ||
      error instanceof InventoryDependencyError ||
      error instanceof InventoryValidationError
    ) {
      throw error;
    }
    if (error?.code === "P2003") {
      throw new InventoryDependencyError(
        `Cannot delete cupboard because dependent storage locations or items exist.`
      );
    }
    if (error?.code === "P2025") {
      throw new InventoryNotFoundError(`Cupboard with ID ${cupboardId} was not found`);
    }
    throw error;
  }
}

// ─── Shelves Service ────────────────────────────────────────────────────────

/**
 * Lists shelves belonging to a specific cupboard.
 */
export async function listShelvesByCupboard(cupboardId: number): Promise<ShelfSummary[]> {
  const validCupboardId = parsePositiveInt(cupboardId, "cupboardId");

  const cupboard = await prisma.cupboard.findUnique({
    where: { id: validCupboardId },
  });
  if (!cupboard) {
    throw new InventoryNotFoundError(`Cupboard with ID ${validCupboardId} was not found`);
  }

  const shelves = await prisma.shelf.findMany({
    where: { cupboardId: validCupboardId },
    orderBy: { name: "asc" },
    include: {
      items: {
        select: { quantity: true },
      },
    },
  });

  return shelves.map((s) => ({
    id: s.id,
    cupboardId: s.cupboardId,
    name: s.name,
    description: s.description,
    itemCount: s.items.length,
    totalQuantity: s.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
}

/**
 * Retrieves a single shelf by ID.
 */
export async function getShelfById(id: number): Promise<ShelfSummary> {
  const shelfId = parsePositiveInt(id, "shelfId");

  const s = await prisma.shelf.findUnique({
    where: { id: shelfId },
    include: {
      items: {
        select: { quantity: true },
      },
    },
  });

  if (!s) {
    throw new InventoryNotFoundError(`Shelf with ID ${shelfId} was not found`);
  }

  return {
    id: s.id,
    cupboardId: s.cupboardId,
    name: s.name,
    description: s.description,
    itemCount: s.items.length,
    totalQuantity: s.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

/**
 * Creates a shelf within a cupboard. Enforces unique shelf name per cupboard.
 * Locks the parent cupboard row in a transaction to prevent race conditions with concurrent cupboard deletion.
 */
export async function createShelf(data: CreateShelfInput) {
  const cupboardId = parsePositiveInt(data.cupboardId, "cupboardId");
  const trimmedName = data.name?.trim();

  if (!trimmedName) {
    throw new InventoryValidationError("Shelf name is required", "NAME_REQUIRED");
  }
  if (trimmedName.length > 100) {
    throw new InventoryValidationError("Shelf name cannot exceed 100 characters", "NAME_TOO_LONG");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock the parent cupboard row to serialize against concurrent deletion
      const lockedCupboard: Array<{ id: number; name: string }> = await tx.$queryRaw`
        SELECT id, name FROM cupboards WHERE id = ${cupboardId} FOR UPDATE
      `;
      if (!lockedCupboard || lockedCupboard.length === 0) {
        throw new InventoryNotFoundError(`Parent cupboard with ID ${cupboardId} was not found`);
      }
      const cupboard = lockedCupboard[0];

      // 2. Check for duplicate shelf name in the same cupboard
      const duplicate = await tx.shelf.findFirst({
        where: {
          cupboardId,
          name: trimmedName,
        },
      });
      if (duplicate) {
        throw new InventoryConflictError(
          `A shelf named "${trimmedName}" already exists in cupboard "${cupboard.name}"`,
          "SHELF_NAME_EXISTS"
        );
      }

      // 3. Create the shelf
      return await tx.shelf.create({
        data: {
          cupboardId,
          name: trimmedName,
          description: data.description?.trim() || null,
        },
      });
    });
  } catch (error: any) {
    if (
      error instanceof InventoryNotFoundError ||
      error instanceof InventoryConflictError ||
      error instanceof InventoryValidationError
    ) {
      throw error;
    }
    if (error?.code === "P2002") {
      throw new InventoryConflictError(
        `A shelf named "${trimmedName}" already exists in this cupboard`,
        "SHELF_NAME_EXISTS"
      );
    }
    if (error?.code === "P2003") {
      throw new InventoryNotFoundError(`Parent cupboard with ID ${cupboardId} was not found`);
    }
    throw error;
  }
}

/**
 * Updates a shelf's name, description, or parent cupboard.
 */
export async function updateShelf(id: number, data: UpdateShelfInput) {
  const shelfId = parsePositiveInt(id, "shelfId");

  const existing = await prisma.shelf.findUnique({
    where: { id: shelfId },
    include: { cupboard: true },
  });
  if (!existing) {
    throw new InventoryNotFoundError(`Shelf with ID ${shelfId} was not found`);
  }

  const updateData: Prisma.ShelfUpdateInput = {};
  const targetCupboardId =
    data.cupboardId !== undefined
      ? parsePositiveInt(data.cupboardId, "cupboardId")
      : existing.cupboardId;

  if (data.cupboardId !== undefined && data.cupboardId !== existing.cupboardId) {
    const targetCupboard = await prisma.cupboard.findUnique({
      where: { id: targetCupboardId },
    });
    if (!targetCupboard) {
      throw new InventoryNotFoundError(`Target cupboard with ID ${targetCupboardId} was not found`);
    }
    updateData.cupboard = { connect: { id: targetCupboardId } };
  }

  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new InventoryValidationError("Shelf name cannot be empty", "NAME_REQUIRED");
    }
    if (trimmedName.length > 100) {
      throw new InventoryValidationError("Shelf name cannot exceed 100 characters", "NAME_TOO_LONG");
    }

    if (trimmedName !== existing.name || targetCupboardId !== existing.cupboardId) {
      const duplicate = await prisma.shelf.findFirst({
        where: {
          cupboardId: targetCupboardId,
          name: trimmedName,
          id: { not: shelfId },
        },
      });
      if (duplicate) {
        throw new InventoryConflictError(
          `A shelf named "${trimmedName}" already exists in the target cupboard`,
          "SHELF_NAME_EXISTS"
        );
      }
    }
    updateData.name = trimmedName;
  }

  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || null;
  }

  try {
    return await prisma.shelf.update({
      where: { id: shelfId },
      data: updateData,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new InventoryConflictError(
        `A shelf with this name already exists in the target cupboard`,
        "SHELF_NAME_EXISTS"
      );
    }
    if (error?.code === "P2003") {
      throw new InventoryNotFoundError(`Target cupboard with ID ${targetCupboardId} was not found`);
    }
    if (error?.code === "P2025") {
      throw new InventoryNotFoundError(`Shelf with ID ${shelfId} was not found`);
    }
    throw error;
  }
}

/**
 * Deletes a shelf only when it contains no inventory items.
 * Uses pessimistic row locking to prevent race conditions with concurrent item creation or moves.
 */
export async function deleteShelf(id: number) {
  const shelfId = parsePositiveInt(id, "shelfId");

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock the shelf row to serialize against concurrent item creation/move/deletion
      const lockedShelves: Array<{ id: number; name: string; cupboard_id: number }> = await tx.$queryRaw`
        SELECT id, name, cupboard_id FROM shelves WHERE id = ${shelfId} FOR UPDATE
      `;
      if (!lockedShelves || lockedShelves.length === 0) {
        throw new InventoryNotFoundError(`Shelf with ID ${shelfId} was not found`);
      }
      const shelf = lockedShelves[0];

      // 2. Lock and check if any items exist on this shelf
      const itemCountResult: Array<{ count: bigint | number }> = await tx.$queryRaw`
        SELECT COUNT(*) as count FROM inventory_items WHERE shelf_id = ${shelfId} FOR UPDATE
      `;
      const itemCount = Number(itemCountResult[0]?.count ?? 0);

      if (itemCount > 0) {
        throw new InventoryDependencyError(
          `Cannot delete shelf "${shelf.name}" because it contains ${itemCount} inventory item(s). Move or delete the items before deleting the shelf.`
        );
      }

      // 3. Delete shelf safely
      await tx.shelf.delete({
        where: { id: shelfId },
      });

      return { success: true, id: shelfId };
    });
  } catch (error: any) {
    if (
      error instanceof InventoryNotFoundError ||
      error instanceof InventoryDependencyError ||
      error instanceof InventoryValidationError
    ) {
      throw error;
    }
    if (error?.code === "P2003") {
      throw new InventoryDependencyError(
        `Cannot delete shelf because dependent inventory items exist. Move or delete the items before deleting the shelf.`
      );
    }
    if (error?.code === "P2025") {
      throw new InventoryNotFoundError(`Shelf with ID ${shelfId} was not found`);
    }
    throw error;
  }
}

// ─── Inventory Items Service ────────────────────────────────────────────────

/**
 * Lists inventory items with resolved shelf and cupboard information.
 * Supports flexible filtering by search term, category, status, cupboard, and shelf.
 */
export async function listInventoryItems(
  filters: InventoryItemFilters = {}
): Promise<InventoryItemDetails[]> {
  const where: Prisma.InventoryItemWhereInput = {};

  if (filters.status) {
    where.status = validateStatus(filters.status);
  }

  if (filters.category && filters.category.trim() && filters.category !== "all") {
    where.category = filters.category.trim();
  }

  if (filters.shelfId) {
    where.shelfId = parsePositiveInt(filters.shelfId, "shelfId");
  }

  if (filters.cupboardId) {
    const cId = parsePositiveInt(filters.cupboardId, "cupboardId");
    where.shelf = {
      ...(where.shelf as Prisma.ShelfWhereInput),
      cupboardId: cId,
    };
  }

  if (filters.searchTerm && filters.searchTerm.trim()) {
    const term = filters.searchTerm.trim();
    where.OR = [
      { name: { contains: term } },
      { category: { contains: term } },
      { shelf: { name: { contains: term } } },
      { shelf: { cupboard: { name: { contains: term } } } },
    ];
  }

  const items = await prisma.inventoryItem.findMany({
    where,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    include: {
      shelf: {
        include: {
          cupboard: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    status: item.status,
    shelfId: item.shelfId,
    shelfName: item.shelf.name,
    cupboardId: item.shelf.cupboard.id,
    cupboardName: item.shelf.cupboard.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

/**
 * Retrieves a single inventory item by ID with resolved shelf and cupboard locations.
 */
export async function getInventoryItemById(id: number): Promise<InventoryItemDetails> {
  const itemId = parsePositiveInt(id, "itemId");

  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: {
      shelf: {
        include: {
          cupboard: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!item) {
    throw new InventoryNotFoundError(`Inventory item with ID ${itemId} was not found`);
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    status: item.status,
    shelfId: item.shelfId,
    shelfName: item.shelf.name,
    cupboardId: item.shelf.cupboard.id,
    cupboardName: item.shelf.cupboard.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Creates a new inventory item on a validated storage shelf.
 * Locks the target shelf row to prevent race conditions with concurrent shelf deletion.
 */
export async function createInventoryItem(
  data: CreateInventoryItemInput
): Promise<InventoryItemDetails> {
  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    throw new InventoryValidationError("Inventory item name is required", "NAME_REQUIRED");
  }
  if (trimmedName.length > 150) {
    throw new InventoryValidationError("Inventory item name cannot exceed 150 characters", "NAME_TOO_LONG");
  }

  const quantity = parseQuantity(data.quantity);
  const shelfId = parsePositiveInt(data.shelfId, "shelfId");
  const status = data.status !== undefined ? validateStatus(data.status) : InventoryStatus.GOOD;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock the target shelf row to serialize against concurrent shelf deletion
      const lockedShelves: Array<{ id: number; name: string; cupboard_id: number; cupboard_name: string }> = await tx.$queryRaw`
        SELECT s.id, s.name, s.cupboard_id, c.name as cupboard_name
        FROM shelves s
        JOIN cupboards c ON s.cupboard_id = c.id
        WHERE s.id = ${shelfId}
        FOR UPDATE
      `;
      if (!lockedShelves || lockedShelves.length === 0) {
        throw new InventoryNotFoundError(`Target storage shelf with ID ${shelfId} was not found`);
      }
      const targetShelf = lockedShelves[0];

      if (data.cupboardId !== undefined) {
        const expectedCupboardId = parsePositiveInt(data.cupboardId, "cupboardId");
        if (targetShelf.cupboard_id !== expectedCupboardId) {
          throw new InventoryValidationError(
            `The selected shelf "${targetShelf.name}" does not belong to cupboard ID ${expectedCupboardId} (belongs to "${targetShelf.cupboard_name}")`,
            "SHELF_CUPBOARD_MISMATCH"
          );
        }
      }

      const created = await tx.inventoryItem.create({
        data: {
          name: trimmedName,
          category: data.category?.trim() || null,
          quantity,
          shelfId,
          status,
        },
        include: {
          shelf: {
            include: {
              cupboard: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        id: created.id,
        name: created.name,
        category: created.category,
        quantity: created.quantity,
        status: created.status,
        shelfId: created.shelfId,
        shelfName: created.shelf.name,
        cupboardId: created.shelf.cupboard.id,
        cupboardName: created.shelf.cupboard.name,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    });
  } catch (error: any) {
    if (
      error instanceof InventoryNotFoundError ||
      error instanceof InventoryValidationError ||
      error instanceof InventoryConflictError
    ) {
      throw error;
    }
    if (error?.code === "P2003") {
      throw new InventoryNotFoundError(`Target storage shelf with ID ${shelfId} was not found`);
    }
    throw error;
  }
}

/**
 * Updates an inventory item's details (name, category, quantity, condition status, or shelf).
 * Uses row locking when changing shelf location to prevent race conditions with shelf deletion.
 */
export async function updateInventoryItem(
  id: number,
  data: UpdateInventoryItemInput
): Promise<InventoryItemDetails> {
  const itemId = parsePositiveInt(id, "itemId");

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock the item row
      const lockedItems: Array<{ id: number; shelf_id: number }> = await tx.$queryRaw`
        SELECT id, shelf_id FROM inventory_items WHERE id = ${itemId} FOR UPDATE
      `;
      if (!lockedItems || lockedItems.length === 0) {
        throw new InventoryNotFoundError(`Inventory item with ID ${itemId} was not found`);
      }

      const updateData: Prisma.InventoryItemUpdateInput = {};

      if (data.name !== undefined) {
        const trimmedName = data.name.trim();
        if (!trimmedName) {
          throw new InventoryValidationError("Inventory item name cannot be empty", "NAME_REQUIRED");
        }
        if (trimmedName.length > 150) {
          throw new InventoryValidationError("Inventory item name cannot exceed 150 characters", "NAME_TOO_LONG");
        }
        updateData.name = trimmedName;
      }

      if (data.category !== undefined) {
        updateData.category = data.category?.trim() || null;
      }

      if (data.quantity !== undefined) {
        updateData.quantity = parseQuantity(data.quantity);
      }

      if (data.status !== undefined) {
        updateData.status = validateStatus(data.status);
      }

      if (data.shelfId !== undefined) {
        const targetShelfId = parsePositiveInt(data.shelfId, "shelfId");
        const lockedShelves: Array<{ id: number; name: string; cupboard_id: number; cupboard_name: string }> = await tx.$queryRaw`
          SELECT s.id, s.name, s.cupboard_id, c.name as cupboard_name
          FROM shelves s
          JOIN cupboards c ON s.cupboard_id = c.id
          WHERE s.id = ${targetShelfId}
          FOR UPDATE
        `;
        if (!lockedShelves || lockedShelves.length === 0) {
          throw new InventoryNotFoundError(`Target storage shelf with ID ${targetShelfId} was not found`);
        }
        const targetShelf = lockedShelves[0];

        if (data.cupboardId !== undefined) {
          const expectedCupboardId = parsePositiveInt(data.cupboardId, "cupboardId");
          if (targetShelf.cupboard_id !== expectedCupboardId) {
            throw new InventoryValidationError(
              `The selected shelf "${targetShelf.name}" does not belong to cupboard ID ${expectedCupboardId}`,
              "SHELF_CUPBOARD_MISMATCH"
            );
          }
        }

        updateData.shelf = { connect: { id: targetShelfId } };
      }

      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: updateData,
        include: {
          shelf: {
            include: {
              cupboard: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        category: updated.category,
        quantity: updated.quantity,
        status: updated.status,
        shelfId: updated.shelfId,
        shelfName: updated.shelf.name,
        cupboardId: updated.shelf.cupboard.id,
        cupboardName: updated.shelf.cupboard.name,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    });
  } catch (error: any) {
    if (
      error instanceof InventoryNotFoundError ||
      error instanceof InventoryValidationError ||
      error instanceof InventoryConflictError
    ) {
      throw error;
    }
    if (error?.code === "P2003") {
      throw new InventoryNotFoundError(
        data.shelfId !== undefined
          ? `Target storage shelf with ID ${data.shelfId} was not found`
          : `Referenced storage location not found`
      );
    }
    if (error?.code === "P2025") {
      throw new InventoryNotFoundError(`Inventory item with ID ${itemId} was not found`);
    }
    throw error;
  }
}

/**
 * Moves an inventory item to a target shelf.
 * Locks the item and target shelf rows to serialize against concurrent shelf deletion or item moves.
 */
export async function moveInventoryItem(
  itemId: number,
  targetShelfId: number,
  targetCupboardId?: number
): Promise<InventoryItemDetails> {
  const validItemId = parsePositiveInt(itemId, "itemId");
  const validTargetShelfId = parsePositiveInt(targetShelfId, "targetShelfId");

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock the item row
      const lockedItems: Array<{
        id: number;
        name: string;
        category: string | null;
        quantity: number;
        status: InventoryStatus;
        shelf_id: number;
        created_at: Date;
        updated_at: Date;
      }> = await tx.$queryRaw`
        SELECT id, name, category, quantity, status, shelf_id, created_at, updated_at
        FROM inventory_items
        WHERE id = ${validItemId}
        FOR UPDATE
      `;
      if (!lockedItems || lockedItems.length === 0) {
        throw new InventoryNotFoundError(`Inventory item with ID ${validItemId} was not found`);
      }
      const item = lockedItems[0];

      // 2. Lock the target shelf row
      const lockedShelves: Array<{
        id: number;
        name: string;
        cupboard_id: number;
        cupboard_name: string;
      }> = await tx.$queryRaw`
        SELECT s.id, s.name, s.cupboard_id, c.name as cupboard_name
        FROM shelves s
        JOIN cupboards c ON s.cupboard_id = c.id
        WHERE s.id = ${validTargetShelfId}
        FOR UPDATE
      `;
      if (!lockedShelves || lockedShelves.length === 0) {
        throw new InventoryNotFoundError(
          `Target storage shelf with ID ${validTargetShelfId} was not found`
        );
      }
      const targetShelf = lockedShelves[0];

      if (targetCupboardId !== undefined) {
        const expectedCupboardId = parsePositiveInt(targetCupboardId, "targetCupboardId");
        if (targetShelf.cupboard_id !== expectedCupboardId) {
          throw new InventoryValidationError(
            `Target shelf "${targetShelf.name}" does not belong to cupboard ID ${expectedCupboardId} (it belongs to "${targetShelf.cupboard_name}")`,
            "SHELF_CUPBOARD_MISMATCH"
          );
        }
      }

      // If already on target shelf, return current item details
      if (item.shelf_id === validTargetShelfId) {
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          status: item.status,
          shelfId: item.shelf_id,
          shelfName: targetShelf.name,
          cupboardId: targetShelf.cupboard_id,
          cupboardName: targetShelf.cupboard_name,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      }

      const updated = await tx.inventoryItem.update({
        where: { id: validItemId },
        data: { shelfId: validTargetShelfId },
        include: {
          shelf: {
            include: {
              cupboard: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        category: updated.category,
        quantity: updated.quantity,
        status: updated.status,
        shelfId: updated.shelfId,
        shelfName: updated.shelf.name,
        cupboardId: updated.shelf.cupboard.id,
        cupboardName: updated.shelf.cupboard.name,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    });
  } catch (error: any) {
    if (
      error instanceof InventoryNotFoundError ||
      error instanceof InventoryValidationError ||
      error instanceof InventoryConflictError
    ) {
      throw error;
    }
    if (error?.code === "P2003") {
      throw new InventoryNotFoundError(
        `Target storage shelf with ID ${validTargetShelfId} was not found`
      );
    }
    if (error?.code === "P2025") {
      throw new InventoryNotFoundError(`Inventory item with ID ${validItemId} was not found`);
    }
    throw error;
  }
}

/**
 * Deletes an inventory item explicitly by ID.
 */
export async function deleteInventoryItem(id: number) {
  const itemId = parsePositiveInt(id, "itemId");

  try {
    const existing = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    if (!existing) {
      throw new InventoryNotFoundError(`Inventory item with ID ${itemId} was not found`);
    }

    await prisma.inventoryItem.delete({
      where: { id: itemId },
    });

    return { success: true, id: itemId };
  } catch (error: any) {
    if (error instanceof InventoryNotFoundError) {
      throw error;
    }
    if (error?.code === "P2025") {
      throw new InventoryNotFoundError(`Inventory item with ID ${itemId} was not found`);
    }
    throw error;
  }
}
