"use client";
import { useState } from "react";
import Link from "next/link";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CommissionPage() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setFormError("");
    setEmailError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const name = (formData.get("name") as string).trim();

    if (!email) { setEmailError("Email is required"); setFormState("error"); return; }
    if (!isValidEmail(email)) { setEmailError("Please enter a valid email address"); setFormState("error"); return; }
    if (!name) { setFormError("Name is required"); setFormState("error"); return; }

    const data = { name, email, message: formData.get("message"), pieceName: "General Inquiry", collection: "N/A" };

    try {
      const res = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send");
      setFormState("success");
    } catch (err: any) {
      setFormState("error");
      setFormError(err.message || "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]/50 backdrop-blur-sm bg-[#0a0a0a]/80">
        <Link href="/" className="text-[#c9a96e] text-sm tracking-[0.4em] font-light uppercase">Atelier</Link>
        <nav className="flex gap-8 text-xs tracking-[0.2em] text-gray-500">
          <Link href="/collection" className="hover:text-[#c9a96e]">Showroom</Link>
          <Link href="/commission" className="text-[#c9a96e]">Commission</Link>
        </nav>
      </header>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24">
        <h1 className="text-4xl md:text-5xl font-serif text-[#c9a96e] text-center mb-4 tracking-widest">Commission</h1>
        <p className="text-center text-gray-600 mb-12 text-sm tracking-wide">Direct inquiries to the atelier. Saved to Supabase + instant email via Resend.</p>

        <div className="w-full max-w-md">
          {formState === "success" ? (
            <div className="border border-[#c9a96e] p-8 text-center bg-[#0a0a0a]/80">
              <p className="text-[#c9a96e] font-serif text-xl mb-2">Request Received</p>
              <p className="text-gray-500 text-sm">A master jeweler will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Name <span className="text-[#c9a96e]">*</span></label>
                <input name="name" type="text" required className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-[#e5e5e5] focus:border-[#c9a96e] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Email <span className="text-[#c9a96e]">*</span></label>
                <input name="email" type="email" required className={`w-full bg-[#111] border px-4 py-3 focus:outline-none ${emailError ? 'border-red-800' : 'border-[#1a1a1a] focus:border-[#c9a96e]'}`} />
                {emailError && <p className="text-red-400 text-xs mt-2">{emailError}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Message</label>
                <textarea name="message" rows={5} className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 focus:border-[#c9a96e] outline-none resize-none" />
              </div>
              {formError && !emailError && <p className="text-red-400 text-xs">{formError}</p>}
              <button type="submit" disabled={formState === "submitting"} className="w-full py-4 bg-[#c9a96e] text-[#0a0a0a] hover:bg-[#b8985d] tracking-[0.2em] text-sm uppercase font-medium disabled:opacity-50">
                {formState === "submitting" ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}