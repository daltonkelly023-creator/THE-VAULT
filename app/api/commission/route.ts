// app/api/commission/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, pieceName, collection, message } = await request.json();

    if (!name || !email || !pieceName) {
      return NextResponse.json(
        { error: "Name, email, and piece are required" },
        { status: 400 }
      );
    }

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
          <body style="font-family:Georgia,serif;background:#0a0a0a;color:#e5e5e5;padding:40px;">
            <h1 style="color:#C5A880;text-align:center;">The Vault</h1>
            <h2 style="text-align:center;color:#666;">Commission Request</h2>
            <p><strong>Client:</strong> ${name} (${email})</p>
            <p><strong>Piece:</strong> ${pieceName}</p>
            <p><strong>Collection:</strong> ${collection || "N/A"}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
            <p style="color:#666;margin-top:40px;text-align:center;">Reply directly to this email to contact the client.</p>
          </body>
        </html>`,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return NextResponse.json(
        { error: "Failed to send email", details: errorText },
        { status: 500 }
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