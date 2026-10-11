import { NextResponse } from "next/server";
import {
  InventoryValidationError,
  InventoryNotFoundError,
  InventoryConflictError,
  InventoryDependencyError,
} from "./inventoryService";

/**
 * Validates and parses a string parameter as a positive integer.
 * Returns null if invalid.
 */
export function parsePositiveIntParam(val: unknown): number | null {
  if (typeof val === "number" && Number.isInteger(val) && val > 0) {
    return val;
  }
  if (typeof val !== "string" && typeof val !== "number") {
    return null;
  }
  const str = String(val).trim();
  if (!/^\d+$/.test(str)) {
    return null;
  }
  const parsed = parseInt(str, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

/**
 * Validates that an incoming payload is a valid non-null JSON object (not an array or primitive).
 */
export function isJsonObject(val: unknown): val is Record<string, any> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

/**
 * Translates domain inventory errors and uncaught exceptions to standardized JSON HTTP responses.
 * Guarantees no sensitive internals, credentials, or stack traces leak to the client.
 */
export function handleInventoryApiError(error: any, contextName = "Inventory API"): NextResponse {
  if (
    error instanceof InventoryValidationError ||
    error instanceof InventoryNotFoundError ||
    error instanceof InventoryConflictError ||
    error instanceof InventoryDependencyError
  ) {
    return NextResponse.json(
      {
        success: false,
        code: error.code,
        message: error.message,
      },
      { status: error.statusCode }
    );
  }

  console.error(`[${contextName}] Unexpected server error:`, error);
  return NextResponse.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred while processing the inventory request",
    },
    { status: 500 }
  );
}
