import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  getCupboardById,
  updateCupboard,
  deleteCupboard,
} from "@/lib/services/inventoryService";
import {
  parsePositiveIntParam,
  isJsonObject,
  handleInventoryApiError,
} from "@/lib/services/inventoryApiUtils";

/**
 * GET /api/inventory/cupboards/[id]
 * Allowed roles: ADMIN, THERAPIST
 * Retrieves a single cupboard with its nested shelves and counts.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const cupboardId = parsePositiveIntParam(rawId);
  if (!cupboardId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Cupboard ID must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const data = await getCupboardById(cupboardId);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleInventoryApiError(error, `GET /api/inventory/cupboards/${rawId}`);
  }
}

/**
 * PATCH /api/inventory/cupboards/[id]
 * Allowed roles: ADMIN only
 * Updates cupboard details (name and/or description).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const cupboardId = parsePositiveIntParam(rawId);
  if (!cupboardId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Cupboard ID must be a positive integer" },
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

    const { name, description } = body;
    if (name === undefined && description === undefined) {
      return NextResponse.json(
        { success: false, code: "NO_FIELDS_TO_UPDATE", message: "At least one field (name or description) must be provided" },
        { status: 400 }
      );
    }

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return NextResponse.json(
        { success: false, code: "INVALID_NAME", message: "Cupboard name cannot be empty" },
        { status: 400 }
      );
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_DESCRIPTION", message: "Description must be a string or null" },
        { status: 400 }
      );
    }

    const updated = await updateCupboard(cupboardId, {
      name: name !== undefined ? name.trim() : undefined,
      description: description !== undefined ? (typeof description === "string" ? description.trim() : null) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Cupboard updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleInventoryApiError(error, `PATCH /api/inventory/cupboards/${rawId}`);
  }
}

/**
 * DELETE /api/inventory/cupboards/[id]
 * Allowed roles: ADMIN only
 * Deletes an empty cupboard. Rejects if cupboard contains any shelves or inventory items.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const { id: rawId } = await context.params;
  const cupboardId = parsePositiveIntParam(rawId);
  if (!cupboardId) {
    return NextResponse.json(
      { success: false, code: "INVALID_ID", message: "Cupboard ID must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteCupboard(cupboardId);
    return NextResponse.json({
      success: true,
      message: "Cupboard deleted successfully",
      data: result,
    });
  } catch (error) {
    return handleInventoryApiError(error, `DELETE /api/inventory/cupboards/${rawId}`);
  }
}
