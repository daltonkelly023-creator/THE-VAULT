import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      message,
      pieceName,
      collection,
      metal,
      stone,
      price_cents,
      budget,
      referenceImages,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // 1. Save to Supabase - this is your inbox that shows in /admin/commissions
    // NOTE: this insert now includes phone, budget, and reference_image_paths.
    // Add these columns to the `commissions` table if they don't exist yet:
    //   alter table commissions add column if not exists phone text;
    //   alter table commissions add column if not exists budget text;
    //   alter table commissions add column if not exists reference_image_paths jsonb;
    const { error: dbError } = await supabaseServer.from("commissions").insert({
      name,
      email,
      phone: phone || null,
      message: message || "",
      piece_name: pieceName || "General Inquiry",
      collection: collection || "N/A",
      metal: metal || null,
      stone: stone || null,
      price_cents: price_cents || null,
      budget: budget || null,
      reference_image_paths: Array.isArray(referenceImages) ? referenceImages : [],
      status: "NEW",
    });

    if (dbError) console.error("DB error:", dbError);

    // 2. Send email via Resend - instant notification to your picked email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to: process.env.COMMISSION_EMAIL || "inquiries@atelier.vault",
          subject: `NEW COMMISSION: ${pieceName || "General"} — ${name} — $${price_cents ? (price_cents/100) : ""}`,
          html: `
            <h2>New Commission Received</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone || "-"}</p>
            <p><b>Piece:</b> ${pieceName}</p>
            <p><b>Collection:</b> ${collection}</p>
            <p><b>Budget:</b> ${budget || "-"}</p>
            <p><b>Message:</b> ${message || ""}</p>
            <p><b>Metal:</b> ${metal || "-"} | <b>Stone:</b> ${stone || "-"}</p>
            ${
              Array.isArray(referenceImages) && referenceImages.length > 0
                ? `<p><b>Reference photos:</b></p><ul>${referenceImages
                    .map((url: string) => `<li><a href="${url}">${url}</a></li>`)
                    .join("")}</ul>`
                : ""
            }
            <hr/>
            <p>View all commissions: YOUR_SITE_URL/admin/commissions</p>
            <p>Supabase Table: commissions</p>
          `,
        });
      } catch (e) {
        console.error("Resend error:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}