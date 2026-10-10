import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";

export async function seedTherapists() {
  const therapistsData = [
    {
      code: "EMP-OT-101",
      name: "Dr. Priya Raman",
      email: "priya.raman@chennaiotclinic.in",
      specialization: "Sensory Integration & Pediatric OT",
      phone: "+91 98401 23456",
    },
    {
      code: "EMP-OT-102",
      name: "Anitha Krishnan",
      email: "anitha.k@chennaiotclinic.in",
      specialization: "Fine Motor & Handwriting Specialist",
      phone: "+91 98402 34567",
    },
    {
      code: "EMP-OT-103",
      name: "Divya Shankar",
      email: "divya.s@chennaiotclinic.in",
      specialization: "Autism Spectrum & Sensory Regulation",
      phone: "+91 98403 45678",
    },
    {
      code: "EMP-OT-104",
      name: "Karthik Subramanian",
      email: "karthik.s@chennaiotclinic.in",
      specialization: "Adult Neuro-Rehabilitation & ADL",
      phone: "+91 98404 56789",
    },
    {
      code: "EMP-OT-105",
      name: "Meena Suresh",
      email: "meena.s@chennaiotclinic.in",
      specialization: "Gross Motor & Postural Correction",
      phone: "+91 98405 67890",
    },
    {
      code: "EMP-OT-106",
      name: "Janani Rajendran",
      email: "janani.r@chennaiotclinic.in",
      specialization: "Hand Therapy & Splinting",
      phone: "+91 98406 78901",
    },
    {
      code: "EMP-OT-107",
      name: "Arun Kumar",
      email: "arun.k@chennaiotclinic.in",
      specialization: "Developmental Delays & Early Intervention",
      phone: "+91 98407 89012",
    },
  ];

  const defaultPasswordHash = await hashPassword("pass@123");

  for (const t of therapistsData) {
    let user = await prisma.user.findUnique({ where: { email: t.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: t.email.split("@")[0],
          email: t.email,
          passwordHash: defaultPasswordHash,
          role: "THERAPIST",
          status: "ACTIVE",
          mustChangePassword: false,
        },
      });
    }

    const existingTherapist = await prisma.therapist.findUnique({
      where: { userId: user.id },
    });

    if (!existingTherapist) {
      await prisma.therapist.create({
        data: {
          userId: user.id,
          therapistCode: t.code,
          name: t.name,
          email: t.email,
          phone: t.phone,
          specialization: t.specialization,
          joiningDate: new Date("2023-06-01"),
          employmentType: "FULL_TIME",
          status: "ACTIVE",
        },
      });
      console.log(`Seeded therapist: ${t.name}`);
    }
  }
}

seedTherapists()
  .then(() => console.log("Therapist seeding completed."))
  .catch(console.error)
  .finally(() => process.exit(0));
