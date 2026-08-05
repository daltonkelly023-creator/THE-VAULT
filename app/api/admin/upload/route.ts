import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `products/${Date.now()}.${fileExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const { error } = await supabaseServer.storage
      .from("vault-assets")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ path: fileName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
