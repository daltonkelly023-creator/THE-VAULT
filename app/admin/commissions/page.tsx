"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Commission = {
  id: string;
  name: string;
  email: string;
  piece_name: string;
  collection: string;
  configuration_summary: string;
  status: "NEW" | "CONTACTED" | "QUOTED" | "SOLD" | "ARCHIVED";
  notes: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  NEW: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  CONTACTED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  QUOTED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  SOLD: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  ARCHIVED: "bg-[#1a3a5a]/50 text-[#3a5570] border-[#0a1a3a]",
};

export default function CommissionsDashboard() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCommissions();
  }, []);

  async function fetchCommissions() {
    const { data } = await supabase
      .from("commissions")
      .select("*")
      .order("created_at", { ascending: false });
    setCommissions(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("commissions").update({ status }).eq("id", id);
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: status as any } : c))
    );
  }

  async function updateNotes(id: string, notes: string) {
    await supabase.from("commissions").update({ notes }).eq("id", id);
  }

  const filtered =
    filter === "ALL"
      ? commissions
      : commissions.filter((c) => c.status === filter);

  const counts = {
    ALL: commissions.length,
    NEW: commissions.filter((c) => c.status === "NEW").length,
    CONTACTED: commissions.filter((c) => c.status === "CONTACTED").length,
    QUOTED: commissions.filter((c) => c.status === "QUOTED").length,
    SOLD: commissions.filter((c) => c.status === "SOLD").length,
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#3a5570] tracking-widest text-sm">Loading commissions...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#02040a] text-[#e5e5e5] pt-16">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#02040a]/90 backdrop-blur-sm border-b border-[#0a1a3a]">
        <Link href="/admin" className="text-xs text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase">
          ← Admin
        </Link>
        <span className="text-[#8ab4e8] font-serif tracking-widest text-sm">COMMISSION DASHBOARD</span>
        <span className="text-xs text-[#3a5570]">{counts.ALL} total</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["ALL", "NEW", "CONTACTED", "QUOTED", "SOLD"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-[10px] tracking-widest uppercase border transition-all duration-300 ${
                filter === s
                  ? "border-[#4a90d9] text-[#8ab4e8] bg-[#4a90d9]/10"
                  : "border-[#0a1a3a] text-[#3a5570] hover:border-[#1a3a5a]"
              }`}
            >
              {s} {counts[s as keyof typeof counts] > 0 && `(${counts[s as keyof typeof counts]})`}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="text-center text-[#3a5570] py-24">No commissions found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="border border-[#0a1a3a] hover:border-[#1a3a5a] transition-all duration-300"
              >
                {/* Row */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className={`text-[10px] px-2 py-1 border ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-[#8ab4e8] truncate">{c.name}</p>
                      <p className="text-[10px] text-[#3a5570] truncate">{c.piece_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-[#3a5570] hidden sm:block">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[#3a5570] text-lg">
                      {expandedId === c.id ? "−" : "+"}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === c.id && (
                  <div className="border-t border-[#0a1a3a] px-4 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[#3a5570] tracking-widest uppercase mb-1">Email</p>
                        <p className="text-[#5a7a9a]">{c.email}</p>
                      </div>
                      <div>
                        <p className="text-[#3a5570] tracking-widest uppercase mb-1">Collection</p>
                        <p className="text-[#5a7a9a] capitalize">{c.collection || "—"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#3a5570] tracking-widest uppercase mb-1">Configuration</p>
                      <pre className="text-[10px] text-[#5a7a9a] bg-[#02040a] border border-[#0a1a3a] p-3 overflow-x-auto whitespace-pre-wrap">
                        {c.configuration_summary}
                      </pre>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-[#3a5570] tracking-widest uppercase mb-2">Status</p>
                        <div className="flex flex-wrap gap-2">
                          {(["NEW", "CONTACTED", "QUOTED", "SOLD", "ARCHIVED"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(c.id, s)}
                              className={`px-3 py-1.5 text-[10px] tracking-widest uppercase border transition-all ${
                                c.status === s
                                  ? "border-[#4a90d9] text-[#8ab4e8] bg-[#4a90d9]/10"
                                  : "border-[#0a1a3a] text-[#3a5570] hover:border-[#1a3a5a]"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#3a5570] tracking-widest uppercase mb-2">Notes</p>
                      <textarea
                        defaultValue={c.notes}
                        onBlur={(e) => updateNotes(c.id, e.target.value)}
                        placeholder="Add internal notes..."
                        className="w-full bg-[#02040a] border border-[#0a1a3a] px-3 py-2 text-xs text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors resize-none h-20"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}