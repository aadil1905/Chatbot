import { NextResponse } from "next/server";

/**
 * @deprecated Use /api/appointments. This route deliberately has no business
 * logic, so appointment creation has one validated implementation.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "This endpoint has been retired. Use /api/appointments.",
    },
    { status: 410 },
  );
}
