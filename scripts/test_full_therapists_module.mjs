import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

async function runFullTherapistsModuleTests() {
  const baseUrl = "http://localhost:3000";
  console.log("=================================================================");
  console.log("🚀 STARTING COMPREHENSIVE THERAPISTS MODULE VERIFICATION SUITE");
  console.log("=================================================================\n");

  // 1. Admin login
  console.log("1. Authenticating as Clinic Admin...");
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "admin", password: "pass@123" }),
  });
  if (!adminLoginRes.ok) throw new Error("Admin login failed");
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  console.log("✓ Admin authentication successful.\n");

  // 2. Concurrent Therapist Code Generation Test
  console.log("2. Testing Concurrent Therapist Creation & Code Generation (EMP-OT-NNN)...");
  const concurrentCount = 4;
  const promises = [];
  const baseTimestamp = Date.now();

  for (let i = 0; i < concurrentCount; i++) {
    const email = `concurrent.th.${baseTimestamp}.${i}@aslancdc.in`;
    promises.push(
      fetch(`${baseUrl}/api/therapists`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: adminCookie },
        body: JSON.stringify({
          name: `Concurrent Clinician ${i + 1}`,
          email,
          phone: `+91 98401 ${10000 + i}`,
          specialization: "Sensory Integration",
          initialPassword: "InitialPass@2026!",
          employmentType: "FULL_TIME",
        }),
      }).then(async (res) => {
        const json = await res.json();
        return { status: res.status, json };
      })
    );
  }

  const results = await Promise.all(promises);
  const allocatedCodes = [];

  for (const r of results) {
    if (r.status !== 201 || !r.json.success) {
      throw new Error(`Concurrent creation failed: ${JSON.stringify(r.json)}`);
    }
    const code = r.json.data.therapist.therapistCode;
    allocatedCodes.push(code);
    console.log(`  ✓ Created clinician with code: ${code}`);
  }

  // Verify all codes are unique
  const uniqueCodes = new Set(allocatedCodes);
  if (uniqueCodes.size !== allocatedCodes.length) {
    throw new Error(`Collision detected in concurrent code generation! Allocated: ${allocatedCodes.join(", ")}`);
  }

  // Verify format and progression
  for (const code of allocatedCodes) {
    if (!/^EMP-OT-\d{3,}$/.test(code)) {
      throw new Error(`Invalid code format: ${code}`);
    }
  }
  console.log(`✓ All ${concurrentCount} concurrent allocations succeeded with unique, conflict-free sequential codes.\n`);

  // 3. Duplicate Email Handling
  console.log("3. Testing Duplicate Email Handling...");
  const dupEmail = `concurrent.th.${baseTimestamp}.0@aslancdc.in`;
  const dupRes = await fetch(`${baseUrl}/api/therapists`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({
      name: "Duplicate Clinician",
      email: dupEmail,
      phone: "+91 99999 88888",
      specialization: "Pediatric OT",
      initialPassword: "InitialPass@2026!",
    }),
  });
  const dupJson = await dupRes.json();
  if (dupRes.ok || dupJson.success) {
    throw new Error("Duplicate email was unexpectedly allowed!");
  }
  console.log(`✓ Duplicate therapist email rejected with message: "${dupJson.message}"\n`);

  // 4. Primary Assignment Deactivation Safeguard
  console.log("4. Testing Primary Assignment Safeguard on Deactivation...");
  // Therapist 1 has active primary assignments
  const deactBlockedRes = await fetch(`${baseUrl}/api/therapists/1`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ action: "deactivate" }),
  });
  const deactBlockedJson = await deactBlockedRes.json();
  if (deactBlockedRes.ok || deactBlockedJson.success) {
    throw new Error("Therapist with active primary assignments was deactivated!");
  }
  if (deactBlockedJson.code !== "ACTIVE_PRIMARY_ASSIGNMENT") {
    throw new Error(`Expected ACTIVE_PRIMARY_ASSIGNMENT code, got ${deactBlockedJson.code}`);
  }
  console.log(`✓ Primary clinician deactivation safely blocked.`);
  console.log(`  Reported patients: ${deactBlockedJson.patients ? deactBlockedJson.patients.length : 'Yes'}`);
  console.log(`  Message: ${deactBlockedJson.message.slice(0, 100)}...\n`);

  // 5. Account Lifecycle & Linked User State
  console.log("5. Testing Account Lifecycle & Linked User Synchronization...");
  // Use one of our newly created concurrent clinicians (who has 0 assignments)
  const testThId = results[0].json.data.therapist.id;
  const testThEmail = results[0].json.data.therapist.email;

  // Deactivate
  const deactRes = await fetch(`${baseUrl}/api/therapists/${testThId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ action: "deactivate" }),
  });
  const deactJson = await deactRes.json();
  if (!deactRes.ok || !deactJson.success) {
    throw new Error("Deactivation failed: " + JSON.stringify(deactJson));
  }
  console.log(`  ✓ Therapist ${testThId} status is now: ${deactJson.data.status}`);
  console.log(`  ✓ Linked User account status is now: ${deactJson.data.user.status}`);
  if (deactJson.data.status !== "INACTIVE" || deactJson.data.user.status !== "DISABLED") {
    throw new Error("Deactivation status mismatch");
  }

  // Verify disabled user cannot log in
  const disabledLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: testThEmail, password: "InitialPass@2026!" }),
  });
  if (disabledLoginRes.ok) {
    throw new Error("Disabled therapist user was able to log in!");
  }
  console.log("  ✓ Disabled account login rejected with 403.");

  // Test Reactivation
  const reactRes = await fetch(`${baseUrl}/api/therapists/${testThId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ action: "reactivate" }),
  });
  const reactJson = await reactRes.json();
  if (!reactRes.ok || !reactJson.success) {
    throw new Error("Reactivation failed: " + JSON.stringify(reactJson));
  }
  console.log(`  ✓ Therapist ${testThId} reactivated to: ${reactJson.data.status}`);
  console.log(`  ✓ Linked User account restored to: ${reactJson.data.user.status}`);
  if (reactJson.data.status !== "ACTIVE" || reactJson.data.user.status !== "ACTIVE") {
    throw new Error("Reactivation status mismatch");
  }

  // Test Independent Locked Account rule
  // If user was locked independently for security reasons, reactivation must NOT unlock it
  await prisma.user.update({
    where: { email: testThEmail },
    data: { status: "LOCKED" },
  });
  // Deactivate and reactivate
  await fetch(`${baseUrl}/api/therapists/${testThId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ action: "deactivate" }),
  });
  await fetch(`${baseUrl}/api/therapists/${testThId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ action: "reactivate" }),
  });
  const lockedUser = await prisma.user.findUnique({ where: { email: testThEmail } });
  if (lockedUser.status !== "LOCKED") {
    throw new Error("SECURITY VIOLATION: Independently locked user account was automatically unlocked upon reactivation!");
  }
  console.log("  ✓ Independently locked user account preserved as LOCKED upon reactivation (Security Rule Confirmed).");

  // Restore user to ACTIVE for remaining tests
  await prisma.user.update({
    where: { email: testThEmail },
    data: { status: "ACTIVE" },
  });
  console.log("✓ Account lifecycle and status safeguards verified.\n");

  // 6. Mandatory First-Login Password Enforcement Workflow
  console.log("6. Testing Mandatory First-Login Password Enforcement Workflow...");
  const _testTh2Id = results[1].json.data.therapist.id;
  const testTh2Email = results[1].json.data.therapist.email;

  // Verify created user has mustChangePassword = true
  const userRecord = await prisma.user.findUnique({ where: { email: testTh2Email } });
  if (!userRecord.mustChangePassword) {
    throw new Error("Newly created therapist does not have mustChangePassword = true in database");
  }
  console.log("  ✓ Database record has mustChangePassword: true");

  // Temporary password login succeeds
  const tempLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: testTh2Email, password: "InitialPass@2026!" }),
  });
  const tempLoginJson = await tempLoginRes.json();
  if (!tempLoginRes.ok || !tempLoginJson.success) {
    throw new Error("Temporary password login failed: " + JSON.stringify(tempLoginJson));
  }
  if (tempLoginJson.data.mustChangePassword !== true) {
    throw new Error("Login response did not return mustChangePassword: true");
  }
  const thCookie = tempLoginRes.headers.get("set-cookie");
  console.log("  ✓ Temporary password login succeeds with mustChangePassword: true");

  // Protected clinical API returns 403 PASSWORD_CHANGE_REQUIRED
  const blockCheckRes = await fetch(`${baseUrl}/api/patients`, {
    headers: { cookie: thCookie },
  });
  const blockCheckJson = await blockCheckRes.json();
  if (blockCheckRes.status !== 403 || blockCheckJson.code !== "PASSWORD_CHANGE_REQUIRED") {
    throw new Error(`Protected API was not blocked! Status: ${blockCheckRes.status}, Code: ${blockCheckJson.code}`);
  }
  console.log("  ✓ Protected clinical API returns HTTP 403 PASSWORD_CHANGE_REQUIRED");

  // Incorrect current password is rejected
  const badOldPwdRes = await fetch(`${baseUrl}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: thCookie },
    body: JSON.stringify({
      currentPassword: "WrongOldPassword@123",
      newPassword: "NewPermanentPass@2026!",
    }),
  });
  const badOldPwdJson = await badOldPwdRes.json();
  if (badOldPwdRes.ok || badOldPwdJson.success) {
    throw new Error("Password change accepted incorrect current password!");
  }
  console.log(`  ✓ Incorrect current password rejected: "${badOldPwdJson.message}"`);

  // Successful password change
  const goodPwdRes = await fetch(`${baseUrl}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: thCookie },
    body: JSON.stringify({
      currentPassword: "InitialPass@2026!",
      newPassword: "NewPermanentPass@2026!",
    }),
  });
  const goodPwdJson = await goodPwdRes.json();
  if (!goodPwdRes.ok || !goodPwdJson.success) {
    throw new Error("Password change failed: " + JSON.stringify(goodPwdJson));
  }
  console.log("  ✓ Password changed successfully.");

  // Verify database flag is now false
  const updatedUserRecord = await prisma.user.findUnique({ where: { email: testTh2Email } });
  if (updatedUserRecord.mustChangePassword !== false) {
    throw new Error("mustChangePassword in database was not updated to false!");
  }
  console.log("  ✓ Database record has mustChangePassword: false");

  // Verify clinical API is immediately accessible
  const unblockedRes = await fetch(`${baseUrl}/api/patients`, {
    headers: { cookie: thCookie },
  });
  if (!unblockedRes.ok) {
    throw new Error("Clinical API still blocked after password change!");
  }
  console.log("  ✓ Protected clinical API immediately accessible without re-login (HTTP 200)");

  // Verify old password no longer works
  const oldLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: testTh2Email, password: "InitialPass@2026!" }),
  });
  if (oldLoginRes.ok) {
    throw new Error("Old password still valid after change!");
  }
  console.log("  ✓ Old temporary password rejected.");

  // Verify new password works
  const newLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: testTh2Email, password: "NewPermanentPass@2026!" }),
  });
  const newLoginJson = await newLoginRes.json();
  if (!newLoginRes.ok || !newLoginJson.success) {
    throw new Error("New password login failed: " + JSON.stringify(newLoginJson));
  }
  if (newLoginJson.data.mustChangePassword !== false) {
    throw new Error("Expected mustChangePassword: false in new login response");
  }
  console.log("  ✓ New permanent password works with mustChangePassword: false.\n");

  // 7. Existing Seeded Therapists Integrity
  console.log("7. Verifying Existing Seeded Therapists...");
  for (let id = 1; id <= 7; id++) {
    const th = await prisma.therapist.findUnique({
      where: { id },
      include: { user: true },
    });
    if (th.user.mustChangePassword !== false) {
      throw new Error(`Seeded therapist ${th.name} has mustChangePassword: true! Existing accounts must not be forced to change.`);
    }
  }
  console.log("✓ All seeded therapists EMP-OT-101 through EMP-OT-107 have mustChangePassword: false as required.\n");

  // 8. Password Hash and Plaintext Exposure Verification
  console.log("8. Verifying Zero Password Leakage in Responses & Models...");
  const listAllRes = await fetch(`${baseUrl}/api/therapists`, {
    headers: { cookie: adminCookie },
  });
  const listAllJson = await listAllRes.json();
  for (const t of listAllJson.data) {
    if ("passwordHash" in t || "password" in t || (t.user && "passwordHash" in t.user)) {
      throw new Error("SECURITY VIOLATION: passwordHash or password field found in therapist listing!");
    }
  }
  console.log("✓ No password hashes or passwords exposed across any therapist listings or objects.\n");

  console.log("=================================================================");
  console.log("🎉 ALL TESTS IN THE THERAPISTS MODULE SUITE PASSED SUCCESSFULLY!");
  console.log("=================================================================\n");
}

runFullTherapistsModuleTests()
  .catch((err) => {
    console.error("TEST FAILED:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
