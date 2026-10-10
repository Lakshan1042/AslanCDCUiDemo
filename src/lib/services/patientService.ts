import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { generateNextPatientCode } from "./patientCodeService";
import type { AuthContext } from "@/types/auth";
import type { Gender, PatientStatus } from "@/generated/prisma/client";

export interface EnrollPatientInput {
  name: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: Gender;
  program?: string;
  primaryConcerns?: string;
  currentPlan?: string;
  primaryTherapistId: number;
  parent: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    initialPassword?: string;
  };
}

export interface PatientFilterInput {
  search?: string;
  therapistId?: number;
  program?: string;
  status?: PatientStatus;
  page?: number;
  limit?: number;
}

/**
 * Lists patients according to caller's role:
 * - Admin: All patients.
 * - Therapist: Only patients where this therapist has an active assignment.
 * - Parent: Only children belonging to this parent.
 */
export async function listPatients(auth: AuthContext, filters: PatientFilterInput = {}) {
  const where: any = {};

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q } },
      { patientCode: { contains: q } },
      { parent: { name: { contains: q } } },
    ];
  }

  if (filters.program && filters.program !== "all") {
    where.program = filters.program;
  }

  if (filters.status && (filters.status as string) !== "all") {
    where.status = filters.status;
  }

  if (auth.role === "THERAPIST") {
    const therapist = await prisma.therapist.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    });
    if (!therapist) return [];

    where.therapistAssignments = {
      some: {
        therapistId: therapist.id,
        isActive: true,
      },
    };
  } else if (auth.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    });
    if (!parent) return [];

    where.parentId = parent.id;
  } else if (filters.therapistId) {
    where.therapistAssignments = {
      some: {
        therapistId: filters.therapistId,
        isActive: true,
      },
    };
  }

  const patients = await prisma.patient.findMany({
    where,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          user: { select: { email: true } },
        },
      },
      therapistAssignments: {
        where: { isActive: true },
        include: {
          therapist: {
            select: { id: true, name: true, specialization: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return patients.map((p) => {
    const primaryAssignment = p.therapistAssignments.find((a) => a.isPrimary) || p.therapistAssignments[0];
    return {
      id: p.id,
      patientCode: p.patientCode,
      name: p.name,
      dateOfBirth: p.dateOfBirth,
      age: p.dateOfBirth
        ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      gender: p.gender,
      status: p.status,
      program: p.program || "",
      primaryConcerns: p.primaryConcerns || "",
      currentPlan: p.currentPlan || "",
      isLocked: p.isLocked,
      enrollmentDate: p.enrollmentDate,
      createdAt: p.createdAt,
      parent: {
        id: p.parent.id,
        name: p.parent.name,
        phone: p.parent.phone,
        email: p.parent.user.email,
        address: p.parent.address || "",
      },
      assignedTherapists: p.therapistAssignments.map((a) => ({
        id: a.therapist.id,
        name: a.therapist.name,
        specialization: a.therapist.specialization,
        isPrimary: a.isPrimary,
        assignedAt: a.assignedAt,
      })),
      primaryTherapist: primaryAssignment
        ? {
            id: primaryAssignment.therapist.id,
            name: primaryAssignment.therapist.name,
          }
        : null,
    };
  });
}

/**
 * Enrolls a new patient transactionally:
 * 1. Generates unique sequential patient code.
 * 2. Checks/links existing parent or creates User -> Parent.
 * 3. Creates Patient.
 * 4. Assigns primary therapist.
 */
export async function enrollPatient(data: EnrollPatientInput) {
  return prisma.$transaction(async (tx) => {
    const patientCode = await generateNextPatientCode(tx);

    const email = data.parent.email.trim().toLowerCase();
    let parentId: number;
    let isNewParent = false;

    const existingUser = await tx.user.findUnique({
      where: { email },
      include: { parent: true },
    });

    if (existingUser) {
      if (existingUser.role !== "PARENT" || !existingUser.parent) {
        throw new Error("This email is registered to a non-parent account");
      }
      parentId = existingUser.parent.id;
    } else {
      isNewParent = true;
      if (!data.parent.initialPassword) {
        throw new Error("Initial password is required for newly provisioned parent accounts");
      }

      const passwordHash = await hashPassword(data.parent.initialPassword);
      const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") + "_" + Math.floor(Math.random() * 1000);

      const newUser = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          role: "PARENT",
          status: "ACTIVE",
          mustChangePassword: true,
        },
      });

      const newParent = await tx.parent.create({
        data: {
          userId: newUser.id,
          name: data.parent.name.trim(),
          phone: data.parent.phone.trim(),
          address: data.parent.address?.trim() || null,
        },
      });

      parentId = newParent.id;
    }

    const patient = await tx.patient.create({
      data: {
        patientCode,
        parentId,
        name: data.name.trim(),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        enrollmentDate: new Date(),
        status: "ACTIVE",
        program: data.program || null,
        primaryConcerns: data.primaryConcerns || null,
        currentPlan: data.currentPlan || null,
        isLocked: false,
      },
    });

    const targetTherapist = await tx.therapist.findUnique({
      where: { id: data.primaryTherapistId },
      select: { id: true, name: true },
    });
    if (!targetTherapist) {
      throw new Error(`The selected primary therapist (ID: ${data.primaryTherapistId}) does not exist in the clinic directory`);
    }

    await tx.patientTherapistAssignment.create({
      data: {
        patientId: patient.id,
        therapistId: data.primaryTherapistId,
        isPrimary: true,
        isActive: true,
        assignedAt: new Date(),
      },
    });

    return {
      patient,
      isNewParent,
      initialPassword: isNewParent ? data.parent.initialPassword : null,
    };
  });
}

/**
 * Assigns or updates a therapist assignment under a row lock on Patient.
 * Enforces single active primary invariant and handles promotion of already-active therapists.
 */
export async function assignTherapistToPatient(
  patientId: number,
  therapistId: number,
  isPrimary: boolean
) {
  return prisma.$transaction(async (tx) => {
    // 1. Acquire exclusive lock on the patient record
    await tx.$queryRaw`SELECT id FROM patients WHERE id = ${patientId} FOR UPDATE`;

    const targetTherapist = await tx.therapist.findUnique({
      where: { id: therapistId },
      select: { id: true, name: true },
    });
    if (!targetTherapist) {
      throw new Error(`The selected therapist (ID: ${therapistId}) does not exist in the clinic directory`);
    }

    // 2. Check for an existing active assignment for this therapist
    const existingActiveAssignment = await tx.patientTherapistAssignment.findFirst({
      where: {
        patientId,
        therapistId,
        isActive: true,
      },
    });

    if (isPrimary) {
      // Step A: Demote any other current active primary therapist
      await tx.patientTherapistAssignment.updateMany({
        where: {
          patientId,
          isActive: true,
          isPrimary: true,
          NOT: { therapistId },
        },
        data: { isPrimary: false },
      });

      if (existingActiveAssignment) {
        // Therapist already active: simply update isPrimary = true without creating duplicate row
        await tx.patientTherapistAssignment.update({
          where: { id: existingActiveAssignment.id },
          data: { isPrimary: true },
        });
      } else {
        // Therapist not currently active: create new assignment row
        await tx.patientTherapistAssignment.create({
          data: {
            patientId,
            therapistId,
            isPrimary: true,
            isActive: true,
            assignedAt: new Date(),
          },
        });
      }
    } else {
      // Assigning as secondary
      if (existingActiveAssignment) {
        // Already active as secondary (or primary) -> if it was primary, keep it or adjust
        // No duplicate row created
      } else {
        await tx.patientTherapistAssignment.create({
          data: {
            patientId,
            therapistId,
            isPrimary: false,
            isActive: true,
            assignedAt: new Date(),
          },
        });
      }
    }

    // 3. Post-condition verification: verify active primary count <= 1
    const activePrimaryCount = await tx.patientTherapistAssignment.count({
      where: {
        patientId,
        isActive: true,
        isPrimary: true,
      },
    });

    if (activePrimaryCount > 1) {
      throw new Error("Concurrency invariant violation: More than one active primary therapist detected");
    }

    return true;
  });
}

/**
 * Unassigns a therapist from a patient. Preserves assignment history.
 * If unassigning the primary therapist, requires a replacement therapist or promotes an active secondary.
 */
export async function unassignTherapistFromPatient(
  patientId: number,
  therapistId: number,
  replacementTherapistId?: number
) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM patients WHERE id = ${patientId} FOR UPDATE`;

    const activeAssignment = await tx.patientTherapistAssignment.findFirst({
      where: {
        patientId,
        therapistId,
        isActive: true,
      },
    });

    if (!activeAssignment) {
      throw new Error("Therapist is not actively assigned to this patient");
    }

    if (activeAssignment.isPrimary) {
      if (!replacementTherapistId) {
        throw new Error("Cannot unassign primary therapist without specifying a replacement primary therapist");
      }

      if (replacementTherapistId === therapistId) {
        throw new Error("Replacement therapist must be different from the therapist being unassigned");
      }

      const replacementTherapist = await tx.therapist.findUnique({
        where: { id: replacementTherapistId },
      });
      if (!replacementTherapist) {
        throw new Error("Replacement therapist does not exist");
      }

      const existingReplacementAssignment = await tx.patientTherapistAssignment.findFirst({
        where: {
          patientId,
          therapistId: replacementTherapistId,
          isActive: true,
        },
      });

      if (existingReplacementAssignment) {
        // Promote existing active secondary therapist to primary
        await tx.patientTherapistAssignment.update({
          where: { id: existingReplacementAssignment.id },
          data: { isPrimary: true },
        });
      } else {
        // Create new active primary assignment
        await tx.patientTherapistAssignment.create({
          data: {
            patientId,
            therapistId: replacementTherapistId,
            isPrimary: true,
            isActive: true,
            assignedAt: new Date(),
          },
        });
      }
    }

    // Deactivate target assignment (preserves history row)
    await tx.patientTherapistAssignment.update({
      where: { id: activeAssignment.id },
      data: {
        isActive: false,
        isPrimary: false,
        unassignedAt: new Date(),
      },
    });

    // Invariant check: patient must have exactly 1 active primary therapist
    const activePrimaryCount = await tx.patientTherapistAssignment.count({
      where: {
        patientId,
        isActive: true,
        isPrimary: true,
      },
    });

    if (activePrimaryCount !== 1) {
      throw new Error(`Invariant violation: Patient must retain exactly 1 active primary therapist, found ${activePrimaryCount}`);
    }

    return true;
  });
}

