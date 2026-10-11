import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  listInventoryItems,
  createInventoryItem,
  type InventoryItemFilters,
} from "@/lib/services/inventoryService";
import {
  parsePositiveIntParam,
  isJsonObject,
  handleInventoryApiError,
} from "@/lib/services/inventoryApiUtils";
import { InventoryStatus } from "@/generated/prisma/enums";

/**
 * GET /api/inventory/items
 * Allowed roles: ADMIN, THERAPIST
 * Lists inventory items with resolved location info and supports query filtering.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const filters: InventoryItemFilters = {};

    const searchTerm = searchParams.get("searchTerm") || searchParams.get("search");
    if (searchTerm && searchTerm.trim()) {
      filters.searchTerm = searchTerm.trim();
    }

    const category = searchParams.get("category");
    if (category && category.trim()) {
      filters.category = category.trim();
    }

    const statusParam = searchParams.get("status");
    if (statusParam && statusParam.trim()) {
      const normalizedStatus = statusParam.trim().toUpperCase();
      if (normalizedStatus === "GOOD") {
        filters.status = InventoryStatus.GOOD;
      } else if (normalizedStatus === "NEED_MAINTENANCE") {
        filters.status = InventoryStatus.NEED_MAINTENANCE;
      } else {
        return NextResponse.json(
          {
            success: false,
            code: "INVALID_STATUS",
            message: "Status must be GOOD or NEED_MAINTENANCE",
          },
          { status: 400 }
        );
      }
    }

    const cupboardIdParam = searchParams.get("cupboardId");
    if (cupboardIdParam) {
      const cId = parsePositiveIntParam(cupboardIdParam);
      if (!cId) {
        return NextResponse.json(
          { success: false, code: "INVALID_CUPBOARD_ID", message: "cupboardId filter must be a positive integer" },
          { status: 400 }
        );
      }
      filters.cupboardId = cId;
    }

    const shelfIdParam = searchParams.get("shelfId");
    if (shelfIdParam) {
      const sId = parsePositiveIntParam(shelfIdParam);
      if (!sId) {
        return NextResponse.json(
          { success: false, code: "INVALID_SHELF_ID", message: "shelfId filter must be a positive integer" },
          { status: 400 }
        );
      }
      filters.shelfId = sId;
    }

    const data = await listInventoryItems(filters);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleInventoryApiError(error, "GET /api/inventory/items");
  }
}

/**
 * POST /api/inventory/items
 * Allowed roles: ADMIN only
 * Creates a new inventory item and places it on a validated storage shelf.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => null);
    if (!isJsonObject(body)) {
      return NextResponse.json(
        { success: false, code: "INVALID_JSON", message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { name, category, quantity, shelfId, cupboardId, status } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, code: "NAME_REQUIRED", message: "Inventory item name is required" },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { success: false, code: "QUANTITY_REQUIRED", message: "Quantity is required" },
        { status: 400 }
      );
    }
    const numQty = typeof quantity === "number" ? quantity : Number(quantity);
    if (!Number.isInteger(numQty) || numQty < 0) {
      return NextResponse.json(
        { success: false, code: "INVALID_QUANTITY", message: "Quantity must be a non-negative integer (0 or greater)" },
        { status: 400 }
      );
    }

    const parsedShelfId = parsePositiveIntParam(shelfId);
    if (!parsedShelfId) {
      return NextResponse.json(
        { success: false, code: "INVALID_SHELF_ID", message: "shelfId must be a positive integer" },
        { status: 400 }
      );
    }

    let parsedCupboardId: number | undefined = undefined;
    if (cupboardId !== undefined && cupboardId !== null) {
      const parsedCId = parsePositiveIntParam(cupboardId);
      if (!parsedCId) {
        return NextResponse.json(
          { success: false, code: "INVALID_CUPBOARD_ID", message: "cupboardId must be a positive integer" },
          { status: 400 }
        );
      }
      parsedCupboardId = parsedCId;
    }

    let itemStatus: InventoryStatus | undefined = undefined;
    if (status !== undefined && status !== null) {
      const norm = String(status).trim().toUpperCase();
      if (norm === "GOOD") {
        itemStatus = InventoryStatus.GOOD;
      } else if (norm === "NEED_MAINTENANCE") {
        itemStatus = InventoryStatus.NEED_MAINTENANCE;
      } else {
        return NextResponse.json(
          { success: false, code: "INVALID_STATUS", message: "Status must be GOOD or NEED_MAINTENANCE" },
          { status: 400 }
        );
      }
    }

    const created = await createInventoryItem({
      name: name.trim(),
      category: typeof category === "string" ? category.trim() : null,
      quantity: numQty,
      shelfId: parsedShelfId,
      cupboardId: parsedCupboardId,
      status: itemStatus,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inventory item created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleInventoryApiError(error, "POST /api/inventory/items");
  }
}
