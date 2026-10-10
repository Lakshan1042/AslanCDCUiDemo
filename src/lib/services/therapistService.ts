import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import type { Prisma, Gender, EmploymentType, TherapistStatus } from "@/generated/prisma/client";

export interface TherapistEducation {
  collegeName?: string;
  degreeProgram?: string;
  yearOfPassing?: string | number;
}

export function serializeEducation(edu?: TherapistEducation | string | null): string | null {
  if (!edu) return null;
  if (typeof edu === "string") {
    try {
      const parsed = JSON.parse(edu);
      return JSON.stringify({
        collegeName: (parsed.collegeName || parsed.college || "").trim(),
        degreeProgram: (parsed.degreeProgram || parsed.degree || "").trim(),
        yearOfPassing: String(parsed.yearOfPassing || parsed.year || "").trim(),
      });
    } catch {
      return JSON.stringify({
        collegeName: edu.trim(),
        degreeProgram: "",
        yearOfPassing: "",
      });
    }
  }

  return JSON.stringify({
    collegeName: (edu.collegeName || "").trim(),
    degreeProgram: (edu.degreeProgram || "").trim(),
    yearOfPassing: edu.yearOfPassing ? String(edu.yearOfPassing).trim() : "",
  });
}

export function parseEducation(raw?: string | null): TherapistEducation | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      collegeName: parsed.collegeName || parsed.college || "",
      degreeProgram: parsed.degreeProgram || parsed.degree || "",
      yearOfPassing: parsed.yearOfPassing || parsed.year || "",
    };
  } catch {
    return {
      collegeName: raw,
      degreeProgram: "",
      yearOfPassing: "",
    };
  }
}

/**
 * Generates the next sequential therapist code formatted as EMP-OT-NNN.
 * Uses MySQL row-level locking (FOR UPDATE) within the active transaction to ensure concurrency safety.
 */
export async function generateNextTherapistCode(
  tx: Prisma.TransactionClient
): Promise<string> {
  const records = await tx.$queryRaw<{ therapist_code: string }[]>`
    SELECT therapist_code FROM therapists 
    WHERE therapist_code LIKE 'EMP-OT-%' 
    FOR UPDATE
  `;

  let maxSeq = 100;
  for (const r of records) {
    const parts = r.therapist_code.split("-");
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num) && num > maxSeq) {
      maxSeq = num;
    }
  }

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(3, "0");
  return `EMP-OT-${paddedSeq}`;
}

export interface TherapistFilterInput {
  search?: string;
  status?: TherapistStatus | "ALL";
  employmentType?: EmploymentType | "ALL";
}

export async function listTherapists(filters: TherapistFilterInput = {}) {
  const where: any = {};

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q } },
      { therapistCode: { contains: q } },
      { email: { contains: q } },
      { specialization: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  if (filters.status && (filters.status as string) !== "ALL") {
    where.status = filters.status;
  }

  if (filters.employmentType && (filters.employmentType as string) !== "ALL") {
    where.employmentType = filters.employmentType;
  }

  const therapists = await prisma.therapist.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          mustChangePassword: true,
        },
      },
      patientAssignments: {
        where: { isActive: true },
        select: {
          id: true,
          isPrimary: true,
          patientId: true,
          patient: {
            select: {
              id: true,
              patientCode: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return therapists.map((t) => {
    const activeAssignments = t.patientAssignments;
    const activePatientCount = activeAssignments.length;
    const primaryPatientCount = activeAssignments.filter((a) => a.isPrimary).length;
    const edu = parseEducation(t.education);

    return {
      id: t.id,
      therapistCode: t.therapistCode,
      name: t.name,
      email: t.email,
      phone: t.phone,
      specialization: t.specialization,
      joiningDate: t.joiningDate,
      employmentType: t.employmentType,
      status: t.status,
      gender: t.gender,
      age: t.age,
      address: t.address,
      education: edu,
      collegeName: edu?.collegeName || "",
      degreeProgram: edu?.degreeProgram || "",
      yearOfPassing: edu?.yearOfPassing || "",
      user: t.user,
      activePatientCount,
      primaryPatientCount,
      assignedPatientIds: activeAssignments.map((a) => String(a.patientId)),
      assignedPatients: activeAssignments.map((a) => ({
        id: a.patient.id,
        patientCode: a.patient.patientCode,
        name: a.patient.name,
        isPrimary: a.isPrimary,
      })),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  });
}

export async function getTherapistById(id: number) {
  const t = await prisma.therapist.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          mustChangePassword: true,
        },
      },
      patientAssignments: {
        where: { isActive: true },
        include: {
          patient: {
            select: {
              id: true,
              patientCode: true,
              name: true,
              status: true,
              program: true,
            },
          },
        },
      },
    },
  });

  if (!t) return null;

  const activeAssignments = t.patientAssignments;
  const activePatientCount = activeAssignments.length;
  const primaryPatientCount = activeAssignments.filter((a) => a.isPrimary).length;
  const edu = parseEducation(t.education);

  return {
    id: t.id,
    therapistCode: t.therapistCode,
    name: t.name,
    email: t.email,
    phone: t.phone,
    specialization: t.specialization,
    joiningDate: t.joiningDate,
    employmentType: t.employmentType,
    status: t.status,
    gender: t.gender,
    age: t.age,
    address: t.address,
    education: edu,
    collegeName: edu?.collegeName || "",
    degreeProgram: edu?.degreeProgram || "",
    yearOfPassing: edu?.yearOfPassing || "",
    user: t.user,
    activePatientCount,
    primaryPatientCount,
    assignedPatientIds: activeAssignments.map((a) => String(a.patientId)),
    assignedPatients: activeAssignments.map((a) => ({
      id: a.patient.id,
      patientCode: a.patient.patientCode,
      name: a.patient.name,
      status: a.patient.status,
      program: a.patient.program,
      isPrimary: a.isPrimary,
      assignedAt: a.assignedAt,
    })),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export interface CreateTherapistInput {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  initialPassword: string;
  age?: number | null;
  gender?: Gender | null;
  address?: string | null;
  joiningDate?: string | Date | null;
  education?: TherapistEducation | string | null;
  employmentType?: EmploymentType;
  status?: TherapistStatus;
}

export async function createTherapist(data: CreateTherapistInput) {
  if (!data.name?.trim()) throw new Error("Therapist name is required");
  if (!data.email?.trim()) throw new Error("Email is required");
  if (!data.phone?.trim()) throw new Error("Phone number is required");
  if (!data.specialization?.trim()) throw new Error("Specialization is required");
  if (!data.initialPassword?.trim()) throw new Error("Initial temporary password is required");

  // Validate initial password strength
  const pwd = data.initialPassword.trim();
  if (pwd.length < 8) {
    throw new Error("Initial password must be at least 8 characters long");
  }
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    throw new Error("Password must include uppercase, lowercase, numeric, and special characters");
  }

  const normalizedEmail = data.email.trim().toLowerCase();

  return prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new Error("Email is already registered to another account");
    }

    const existingTherapist = await tx.therapist.findFirst({
      where: { email: normalizedEmail },
    });
    if (existingTherapist) {
      throw new Error("Email is already registered to a therapist");
    }

    // Generate unique sequential therapist code (EMP-OT-NNN)
    const therapistCode = await generateNextTherapistCode(tx);

    // Generate unique username
    let baseUsername = normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
    if (!baseUsername) baseUsername = "therapist";
    let username = baseUsername;
    let counter = 1;
    while (await tx.user.findUnique({ where: { username } })) {
      username = `${baseUsername}_${counter++}`;
    }

    const passwordHash = await hashPassword(pwd);

    const newUser = await tx.user.create({
      data: {
        username,
        email: normalizedEmail,
        passwordHash,
        role: "THERAPIST",
        status: "ACTIVE",
        mustChangePassword: true,
      },
    });

    const parsedJoiningDate = data.joiningDate
      ? new Date(data.joiningDate)
      : new Date();

    const newTherapist = await tx.therapist.create({
      data: {
        userId: newUser.id,
        therapistCode,
        name: data.name.trim(),
        email: normalizedEmail,
        phone: data.phone.trim(),
        specialization: data.specialization.trim(),
        joiningDate: isNaN(parsedJoiningDate.getTime()) ? new Date() : parsedJoiningDate,
        employmentType: data.employmentType || "FULL_TIME",
        status: data.status || "ACTIVE",
        gender: data.gender || null,
        age: data.age !== undefined && data.age !== null ? Number(data.age) : null,
        address: data.address?.trim() || null,
        education: serializeEducation(data.education),
      },
    });

    return {
      therapist: {
        id: newTherapist.id,
        therapistCode: newTherapist.therapistCode,
        name: newTherapist.name,
        email: newTherapist.email,
        phone: newTherapist.phone,
        specialization: newTherapist.specialization,
        joiningDate: newTherapist.joiningDate,
        employmentType: newTherapist.employmentType,
        status: newTherapist.status,
        gender: newTherapist.gender,
        age: newTherapist.age,
        address: newTherapist.address,
        education: parseEducation(newTherapist.education),
        userId: newUser.id,
        username: newUser.username,
        mustChangePassword: newUser.mustChangePassword,
      },
      // Returned only in this transactional creation response for one-time credential handover dialog
      initialPassword: pwd,
    };
  });
}

export interface UpdateTherapistInput {
  name?: string;
  phone?: string;
  specialization?: string;
  joiningDate?: string | Date;
  gender?: Gender | null;
  age?: number | null;
  address?: string | null;
  education?: TherapistEducation | string | null;
  employmentType?: EmploymentType;
  status?: TherapistStatus;
}

export async function deactivateTherapist(id: number) {
  return prisma.$transaction(async (tx) => {
    const therapist = await tx.therapist.findUnique({
      where: { id },
      include: {
        user: true,
        patientAssignments: {
          where: { isActive: true },
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                patientCode: true,
              },
            },
          },
        },
      },
    });

    if (!therapist) {
      throw new Error("Therapist not found");
    }

    // Check if therapist is active primary for any patient
    const activePrimaryAssignments = therapist.patientAssignments.filter(
      (a) => a.isPrimary
    );

    if (activePrimaryAssignments.length > 0) {
      const patientList = activePrimaryAssignments
        .map((a) => `${a.patient.name} (${a.patient.patientCode})`)
        .join(", ");
      const error: any = new Error(
        `Cannot deactivate therapist. They are currently the active primary clinician for ${activePrimaryAssignments.length} patient(s): ${patientList}. Please reassign primary responsibility before deactivating.`
      );
      error.code = "ACTIVE_PRIMARY_ASSIGNMENT";
      error.patients = activePrimaryAssignments.map((a) => a.patient);
      throw error;
    }

    // Safely deactivate secondary assignments, preserving history
    const activeSecondaryAssignments = therapist.patientAssignments.filter(
      (a) => !a.isPrimary
    );
    if (activeSecondaryAssignments.length > 0) {
      await tx.patientTherapistAssignment.updateMany({
        where: {
          therapistId: id,
          isActive: true,
          isPrimary: false,
        },
        data: {
          isActive: false,
          unassignedAt: new Date(),
        },
      });
    }

    // Deactivate therapist
    const updatedTherapist = await tx.therapist.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    // Disable linked user account only if currently ACTIVE.
    // Accounts independently LOCKED for security reasons must preserve their LOCKED state so reactivation will not unlock them.
    if (therapist.userId && therapist.user?.status === "ACTIVE") {
      await tx.user.update({
        where: { id: therapist.userId },
        data: { status: "DISABLED" },
      });
    }

    return {
      success: true,
      therapist: updatedTherapist,
      deactivatedSecondaryCount: activeSecondaryAssignments.length,
    };
  });
}

export async function reactivateTherapist(id: number) {
  return prisma.$transaction(async (tx) => {
    const therapist = await tx.therapist.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!therapist) {
      throw new Error("Therapist not found");
    }

    const updatedTherapist = await tx.therapist.update({
      where: { id },
      data: { status: "ACTIVE" },
    });

    // Only enable linked user if previous status was DISABLED.
    // If the account was LOCKED independently for security reasons, do not unlock automatically.
    if (therapist.user && therapist.user.status === "DISABLED") {
      await tx.user.update({
        where: { id: therapist.userId },
        data: { status: "ACTIVE" },
      });
    }

    return {
      success: true,
      therapist: updatedTherapist,
    };
  });
}

export async function updateTherapist(id: number, data: UpdateTherapistInput) {
  // If status transition requested, route through safe lifecycle methods
  if (data.status === "INACTIVE") {
    await deactivateTherapist(id);
  } else if (data.status === "ACTIVE") {
    await reactivateTherapist(id);
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.phone !== undefined) updateData.phone = data.phone.trim();
  if (data.specialization !== undefined) updateData.specialization = data.specialization.trim();
  if (data.joiningDate !== undefined) {
    const d = new Date(data.joiningDate);
    if (!isNaN(d.getTime())) updateData.joiningDate = d;
  }
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.age !== undefined) updateData.age = data.age !== null ? Number(data.age) : null;
  if (data.address !== undefined) updateData.address = data.address?.trim() || null;
  if (data.education !== undefined) updateData.education = serializeEducation(data.education);
  if (data.employmentType !== undefined) updateData.employmentType = data.employmentType;

  if (Object.keys(updateData).length > 0) {
    await prisma.therapist.update({
      where: { id },
      data: updateData,
    });
  }

  return getTherapistById(id);
}
