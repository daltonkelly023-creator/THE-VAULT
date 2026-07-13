"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("password", password);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError("Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="text-[#c9a96e] text-sm tracking-[0.4em] font-light uppercase mb-2">Atelier</h1>
          <p className="text-gray-600 text-xs tracking-widest">Staff Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest text-gray-500 uppercase mb-3">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-4 text-sm text-white placeholder-gray-700 focus:border-[#c9a96e] outline-none transition-colors tracking-wider"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#c9a96e] text-black text-xs tracking-[0.2em] uppercase font-medium rounded hover:bg-[#b8985d] transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>

        <p className="text-center text-gray-800 text-[10px] tracking-wider mt-8">
          Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}