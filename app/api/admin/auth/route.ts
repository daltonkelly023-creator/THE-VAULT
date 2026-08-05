import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: "Admin not configured" }, { status: 500 });
  }
  const formData = await request.formData();
  const password = formData.get("password") as string;

  if (password === ADMIN_PASSWORD) {
    const cookieStore = cookies();
    cookieStore.set("admin-auth", "vault-admin-2024", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
