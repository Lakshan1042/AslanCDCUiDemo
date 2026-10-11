import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  listCupboardsWithShelves,
  createCupboard,
} from "@/lib/services/inventoryService";
import {
  isJsonObject,
  handleInventoryApiError,
} from "@/lib/services/inventoryApiUtils";

/**
 * GET /api/inventory/cupboards
 * Allowed roles: ADMIN, THERAPIST
 * Returns list of all storage cupboards with nested shelves and aggregate quantities.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await listCupboardsWithShelves();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleInventoryApiError(error, "GET /api/inventory/cupboards");
  }
}

/**
 * POST /api/inventory/cupboards
 * Allowed roles: ADMIN only
 * Creates a new storage cupboard.
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

    const { name, description } = body;
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, code: "NAME_REQUIRED", message: "Cupboard name is required" },
        { status: 400 }
      );
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_DESCRIPTION", message: "Description must be a string or null" },
        { status: 400 }
      );
    }

    const created = await createCupboard({
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cupboard created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleInventoryApiError(error, "POST /api/inventory/cupboards");
  }
}
