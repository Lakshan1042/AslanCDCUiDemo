import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  type UpdateInventoryItemInput,
} from "@/lib/services/inventoryService";
import {
  parsePositiveIntParam,
  isJsonObject,
  handleInventoryApiError,
} from "@/lib/services/inventoryApiUtils";
import { InventoryStatus } from "@/generated/prisma/enums";

/**
 * GET /api/inventory/items/[id]
 * Allowed roles: ADMIN, THERAPIST
 * Retrieves details for a single inventory item including resolved location hierarchy.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const itemId = parsePositiveIntParam(rawId);
  if (!itemId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Item ID must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const data = await getInventoryItemById(itemId);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleInventoryApiError(error, `GET /api/inventory/items/${rawId}`);
  }
}

/**
 * PATCH /api/inventory/items/[id]
 * Allowed roles: ADMIN only
 * Updates item details (name, category, quantity, shelfId, cupboardId, status).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const itemId = parsePositiveIntParam(rawId);
  if (!itemId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Item ID must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!isJsonObject(body)) {
      return NextResponse.json(
        { success: false, code: "INVALID_JSON", message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { name, category, quantity, shelfId, cupboardId, status } = body;
    if (
      name === undefined &&
      category === undefined &&
      quantity === undefined &&
      shelfId === undefined &&
      cupboardId === undefined &&
      status === undefined
    ) {
      return NextResponse.json(
        { success: false, code: "NO_FIELDS_TO_UPDATE", message: "At least one valid field must be provided to update" },
        { status: 400 }
      );
    }

    const updateInput: UpdateInventoryItemInput = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, code: "INVALID_NAME", message: "Item name cannot be empty" },
          { status: 400 }
        );
      }
      updateInput.name = name.trim();
    }

    if (category !== undefined) {
      updateInput.category = typeof category === "string" ? category.trim() : null;
    }

    if (quantity !== undefined) {
      const numQty = typeof quantity === "number" ? quantity : Number(quantity);
      if (!Number.isInteger(numQty) || numQty < 0) {
        return NextResponse.json(
          { success: false, code: "INVALID_QUANTITY", message: "Quantity must be a non-negative integer (0 or greater)" },
          { status: 400 }
        );
      }
      updateInput.quantity = numQty;
    }

    if (shelfId !== undefined) {
      const parsedShelfId = parsePositiveIntParam(shelfId);
      if (!parsedShelfId) {
        return NextResponse.json(
          { success: false, code: "INVALID_SHELF_ID", message: "shelfId must be a positive integer" },
          { status: 400 }
        );
      }
      updateInput.shelfId = parsedShelfId;
    }

    if (cupboardId !== undefined) {
      if (cupboardId === null) {
        updateInput.cupboardId = undefined;
      } else {
        const parsedCId = parsePositiveIntParam(cupboardId);
        if (!parsedCId) {
          return NextResponse.json(
            { success: false, code: "INVALID_CUPBOARD_ID", message: "cupboardId must be a positive integer" },
            { status: 400 }
          );
        }
        updateInput.cupboardId = parsedCId;
      }
    }

    if (status !== undefined) {
      const norm = String(status).trim().toUpperCase();
      if (norm === "GOOD") {
        updateInput.status = InventoryStatus.GOOD;
      } else if (norm === "NEED_MAINTENANCE") {
        updateInput.status = InventoryStatus.NEED_MAINTENANCE;
      } else {
        return NextResponse.json(
          { success: false, code: "INVALID_STATUS", message: "Status must be GOOD or NEED_MAINTENANCE" },
          { status: 400 }
        );
      }
    }

    const updated = await updateInventoryItem(itemId, updateInput);
    return NextResponse.json({
      success: true,
      message: "Inventory item updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleInventoryApiError(error, `PATCH /api/inventory/items/${rawId}`);
  }
}

/**
 * DELETE /api/inventory/items/[id]
 * Allowed roles: ADMIN only
 * Explicitly removes an inventory item.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const itemId = parsePositiveIntParam(rawId);
  if (!itemId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Item ID must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteInventoryItem(itemId);
    return NextResponse.json({
      success: true,
      message: "Inventory item deleted successfully",
      data: result,
    });
  } catch (error) {
    return handleInventoryApiError(error, `DELETE /api/inventory/items/${rawId}`);
  }
}
