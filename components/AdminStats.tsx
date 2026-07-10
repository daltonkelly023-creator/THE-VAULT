"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    totalCommissions: 0,
    newCommissions: 0,
    totalValue: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [{ count: totalProducts }, { count: publishedProducts }, { data: commissions }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("commissions").select("status, piece_name"),
      ]);

      const newCommissions = commissions?.filter(c => c.status === "NEW").length || 0;
      const totalValue = commissions?.length || 0; // You could calculate actual value here

      setStats({
        totalProducts: totalProducts || 0,
        publishedProducts: publishedProducts || 0,
        totalCommissions: commissions?.length || 0,
        newCommissions,
        totalValue,
      });
    }

    fetchStats();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.totalProducts, color: "text-[#8ab4e8]" },
    { label: "Published", value: stats.publishedProducts, color: "text-emerald-400" },
    { label: "Commissions", value: stats.totalCommissions, color: "text-[#4a90d9]" },
    { label: "New Leads", value: stats.newCommissions, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="border border-[#0a1a3a] p-4 text-center">
          <p className="text-[10px] text-[#3a5570] tracking-widest uppercase mb-2">{card.label}</p>
          <p className={`text-2xl font-serif ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}