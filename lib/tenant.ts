import "server-only";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can, type Permission } from "@/lib/permissions";

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }

  return { user, response: null };
}

/**
 * Use this at every API mutation boundary. UI visibility is not an access
 * control: a signed-in user can call an endpoint directly.
 */
export async function requireApiPermission(permission: Permission) {
  const result = await requireApiUser();
  if (!result.user) return result;
  if (!can(result.user.role, permission)) {
    return {
      user: null,
      response: NextResponse.json({ error: "You do not have permission to perform this action." }, { status: 403 }),
    };
  }
  return result;
}
