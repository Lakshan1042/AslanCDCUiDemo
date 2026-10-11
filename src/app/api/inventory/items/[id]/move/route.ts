import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import { moveInventoryItem } from "@/lib/services/inventoryService";
import {
  parsePositiveIntParam,
  isJsonObject,
  handleInventoryApiError,
} from "@/lib/services/inventoryApiUtils";

/**
 * POST /api/inventory/items/[id]/move
 * Allowed roles: ADMIN only
 * Moves an inventory item to a specified target shelf and verifies cupboard relationship integrity.
 */
export async function POST(
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

    const { targetShelfId, targetCupboardId } = body;

    const parsedTargetShelfId = parsePositiveIntParam(targetShelfId);
    if (!parsedTargetShelfId) {
      return NextResponse.json(
        { success: false, code: "INVALID_TARGET_SHELF_ID", message: "targetShelfId must be a positive integer" },
        { status: 400 }
      );
    }

    let parsedTargetCupboardId: number | undefined = undefined;
    if (targetCupboardId !== undefined && targetCupboardId !== null) {
      const parsedCId = parsePositiveIntParam(targetCupboardId);
      if (!parsedCId) {
        return NextResponse.json(
          { success: false, code: "INVALID_TARGET_CUPBOARD_ID", message: "targetCupboardId must be a positive integer" },
          { status: 400 }
        );
      }
      parsedTargetCupboardId = parsedCId;
    }

    const moved = await moveInventoryItem(
      itemId,
      parsedTargetShelfId,
      parsedTargetCupboardId
    );

    return NextResponse.json({
      success: true,
      message: "Inventory item moved successfully",
      data: moved,
    });
  } catch (error) {
    return handleInventoryApiError(error, `POST /api/inventory/items/${rawId}/move`);
  }
}
