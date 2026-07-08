// app/contact/page.tsx
"use client";

import { useState } from "react";

export default function Contact() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setFormError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      pieceName: "General Inquiry",
      collection: "N/A",
    };

    try {
      const res = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to send");
      }

      setFormState("success");
    } catch (err: any) {
      setFormState("error");
      setFormError(err.message || "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-24 max-w-xl mx-auto">
      <h1 className="text-4xl font-serif text-[#C5A880] text-center mb-4 tracking-widest">
        Commission
      </h1>
      <p className="text-center text-[#666] mb-12 text-sm">
        Direct inquiries to the atelier.
      </p>

      {formState === "success" ? (
        <div className="border border-[#C5A880] p-8 text-center">
          <p className="text-[#C5A880] font-serif text-xl mb-2">Request Received</p>
          <p className="text-[#888] text-sm">
            A master jeweler will contact you within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">Message</label>
            <textarea
              name="message"
              rows={5}
              required
              className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors resize-none"
            />
          </div>

          {formState === "error" && (
            <p className="text-red-400 text-xs">{formError}</p>
          )}

          <button
            type="submit"
            disabled={formState === "submitting"}
            className="w-full py-3 bg-[#C5A880] text-[#0a0a0a] hover:bg-[#b89a70] transition-colors tracking-widest text-sm uppercase disabled:opacity-50"
          >
            {formState === "submitting" ? "Sending..." : "Send Inquiry"}
          </button>
        </form>
      )}

      <p className="text-center text-[#666] text-xs mt-8">
        Or email directly:{" "}
        <a 
          href="mailto:goblinsharkyellow@gmail.com" 
          className="text-[#C5A880] hover:text-[#e5e5e5] transition-colors border-b border-[#C5A880]/50 hover:border-[#e5e5e5] pb-0.5"
        >
          goblinsharkyellow@gmail.com
        </a>
      </p>
    </main>
  );
}