import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import { createShelf } from "@/lib/services/inventoryService";
import {
  parsePositiveIntParam,
  isJsonObject,
  handleInventoryApiError,
} from "@/lib/services/inventoryApiUtils";

/**
 * POST /api/inventory/cupboards/[id]/shelves
 * Allowed roles: ADMIN only
 * Creates a new shelf inside the specified cupboard.
 */
export async function POST(
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
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, code: "NAME_REQUIRED", message: "Shelf name is required" },
        { status: 400 }
      );
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_DESCRIPTION", message: "Description must be a string or null" },
        { status: 400 }
      );
    }

    const created = await createShelf({
      cupboardId,
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Shelf created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleInventoryApiError(error, `POST /api/inventory/cupboards/${rawId}/shelves`);
  }
}
