import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  getShelfById,
  updateShelf,
  deleteShelf,
} from "@/lib/services/inventoryService";
import {
  parsePositiveIntParam,
  isJsonObject,
  handleInventoryApiError,
} from "@/lib/services/inventoryApiUtils";

/**
 * GET /api/inventory/shelves/[id]
 * Allowed roles: ADMIN, THERAPIST
 * Retrieves details for a specific shelf location.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const shelfId = parsePositiveIntParam(rawId);
  if (!shelfId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Shelf ID must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const data = await getShelfById(shelfId);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleInventoryApiError(error, `GET /api/inventory/shelves/${rawId}`);
  }
}

/**
 * PATCH /api/inventory/shelves/[id]
 * Allowed roles: ADMIN only
 * Updates shelf details (name, description, or parent cupboard).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const shelfId = parsePositiveIntParam(rawId);
  if (!shelfId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Shelf ID must be a positive integer" },
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

    const { name, description, cupboardId } = body;
    if (name === undefined && description === undefined && cupboardId === undefined) {
      return NextResponse.json(
        { success: false, code: "NO_FIELDS_TO_UPDATE", message: "At least one field (name, description, or cupboardId) must be provided" },
        { status: 400 }
      );
    }

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return NextResponse.json(
        { success: false, code: "INVALID_NAME", message: "Shelf name cannot be empty" },
        { status: 400 }
      );
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_DESCRIPTION", message: "Description must be a string or null" },
        { status: 400 }
      );
    }

    let parsedCupboardId: number | undefined = undefined;
    if (cupboardId !== undefined) {
      const parsed = parsePositiveIntParam(cupboardId);
      if (!parsed) {
        return NextResponse.json(
          { success: false, code: "INVALID_CUPBOARD_ID", message: "Cupboard ID must be a positive integer" },
          { status: 400 }
        );
      }
      parsedCupboardId = parsed;
    }

    const updated = await updateShelf(shelfId, {
      name: name !== undefined ? name.trim() : undefined,
      description: description !== undefined ? (typeof description === "string" ? description.trim() : null) : undefined,
      cupboardId: parsedCupboardId,
    });

    return NextResponse.json({
      success: true,
      message: "Shelf updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleInventoryApiError(error, `PATCH /api/inventory/shelves/${rawId}`);
  }
}

/**
 * DELETE /api/inventory/shelves/[id]
 * Allowed roles: ADMIN only
 * Deletes an empty shelf. Rejects if the shelf contains any inventory items.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const shelfId = parsePositiveIntParam(rawId);
  if (!shelfId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Shelf ID must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteShelf(shelfId);
    return NextResponse.json({
      success: true,
      message: "Shelf deleted successfully",
      data: result,
    });
  } catch (error) {
    return handleInventoryApiError(error, `DELETE /api/inventory/shelves/${rawId}`);
  }
}
