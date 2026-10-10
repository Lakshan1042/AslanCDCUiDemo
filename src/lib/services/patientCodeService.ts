import type { Prisma } from "@/generated/prisma/client";

/**
 * Returns the current calendar year in the clinic's local timezone (Asia/Kolkata).
 */
export function getCurrentKolkataYear(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
  }).formatToParts(new Date());

  const yearPart = parts.find((p) => p.type === "year");
  return yearPart ? parseInt(yearPart.value, 10) : new Date().getFullYear();
}

/**
 * Transaction-safe sequential patient code generator.
 * Format: PT-YYYY-NNN (e.g., PT-2026-001)
 *
 * Runs inside an active interactive transaction.
 * Uses MySQL row-level upsert locking on `patient_code_sequences` to serialize concurrent requests.
 * Counter rollbacks with the transaction if enrollment fails.
 */
export async function generateNextPatientCode(
  tx: Prisma.TransactionClient
): Promise<string> {
  const year = getCurrentKolkataYear();

  // Atomically initialize or increment sequence for the current year
  await tx.$executeRaw`
    INSERT INTO patient_code_sequences (year, last_sequence, updated_at)
    VALUES (${year}, 1, NOW())
    ON DUPLICATE KEY UPDATE
      last_sequence = last_sequence + 1,
      updated_at = NOW()
  `;

  // Fetch the locked sequence number allocated for this transaction
  const record = await tx.patientCodeSequence.findUnique({
    where: { year },
    select: { lastSequence: true },
  });

  const nextSeq = record?.lastSequence ?? 1;
  const paddedSeq = String(nextSeq).padStart(3, "0");

  return `PT-${year}-${paddedSeq}`;
}

/**
 * Audits existing patient codes for the given year and ensures the counter starts
 * above any pre-existing codes (preventing collision on existing seed/production data).
 */
export async function initializePatientCodeSequence(
  tx: Prisma.TransactionClient,
  year?: number
): Promise<void> {
  const targetYear = year ?? getCurrentKolkataYear();

  const existingPatients = await tx.patient.findMany({
    where: {
      patientCode: {
        startsWith: `PT-${targetYear}-`,
      },
    },
    select: { patientCode: true },
  });

  let maxSeq = 0;
  for (const p of existingPatients) {
    const parts = p.patientCode.split("-");
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  await tx.$executeRaw`
    INSERT INTO patient_code_sequences (year, last_sequence, updated_at)
    VALUES (${targetYear}, ${maxSeq}, NOW())
    ON DUPLICATE KEY UPDATE
      last_sequence = GREATEST(last_sequence, ${maxSeq}),
      updated_at = NOW()
  `;
}
