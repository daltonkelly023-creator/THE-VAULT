import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { name, email, pieceName, collection, message } = await request.json();

    if (!name || !email || !pieceName) {
      return NextResponse.json(
        { error: "Name, email, and piece are required" },
        { status: 400 }
      );
    }

    // 1. Save to database first
    const { error: dbError } = await supabase.from("commissions").insert({
      name,
      email,
      piece_name: pieceName,
      collection,
      configuration_summary: message,
      message,
      status: "NEW",
      notes: "",
    });

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to save commission", details: dbError.message },
        { status: 500 }
      );
    }

    // 2. Send email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The Vault <onboarding@resend.dev>",
        to: "goblinsharkyellow@gmail.com",
        reply_to: email,
        subject: `Commission Request: ${pieceName}`,
        html: `<html>
          <body style="font-family:Georgia,serif;background:#02040a;color:#e5e5e5;padding:40px;">
            <h1 style="color:#8ab4e8;text-align:center;">The Vault</h1>
            <h2 style="text-align:center;color:#3a5570;">Commission Request</h2>
            <p><strong style="color:#5a7a9a;">Client:</strong> ${name} (${email})</p>
            <p><strong style="color:#5a7a9a;">Piece:</strong> ${pieceName}</p>
            <p><strong style="color:#5a7a9a;">Collection:</strong> ${collection || "N/A"}</p>
            ${message ? `<p><strong style="color:#5a7a9a;">Message:</strong></p><pre style="background:#0a1a3a;padding:12px;border-radius:4px;color:#5a7a9a;font-size:12px;">${message}</pre>` : ""}
            <p style="color:#3a5570;margin-top:40px;text-align:center;font-size:12px;">Reply directly to this email to contact the client. View all commissions in your admin dashboard.</p>
          </body>
        </html>`,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return NextResponse.json(
        { error: "Saved to database but failed to send email", details: errorText },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}