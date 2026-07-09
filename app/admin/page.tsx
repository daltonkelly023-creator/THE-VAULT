"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, this should be a server check. For now, client-side with env.
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      sessionStorage.setItem("admin-auth", "true");
      router.push("/admin/products");
    } else {
      setError(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#02040a] flex items-center justify-center relative overflow-hidden">
      {/* Abyss background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-[#040818] to-[#02040a]" />
        <div className="absolute top-0 left-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(74,144,217,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">
        <h1 className="text-3xl font-serif text-[#8ab4e8] text-center mb-2 tracking-widest">THE VAULT</h1>
        <p className="text-[#3a5570] text-xs text-center tracking-[0.3em] uppercase mb-10">Admin Access</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter passphrase"
              className="w-full bg-[#0a0a0a]/80 border border-[#0a1a3a] px-4 py-3 text-[#8ab4e8] text-center tracking-widest text-sm focus:border-[#4a90d9] focus:outline-none transition-colors placeholder:text-[#1a3a5a]"
            />
          </div>

          {error && (
            <p className="text-[#c94040] text-xs text-center tracking-widest">Access Denied</p>
          )}

          <button
            type="submit"
            className="w-full py-3 border border-[#4a90d9] text-[#4a90d9] hover:bg-[#4a90d9] hover:text-[#02040a] transition-all tracking-[0.2em] text-xs uppercase"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}