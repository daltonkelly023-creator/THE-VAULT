import { supabaseServer } from "@/lib/supabaseServer";

export default async function AdminStats() {
  const [{ count: totalProducts }, { count: publishedProducts }, { count: totalCommissions }, { count: newCommissions }] = await Promise.all([
    supabaseServer.from("products").select("*", { count: "exact", head: true }),
    supabaseServer.from("products").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabaseServer.from("commissions").select("*", { count: "exact", head: true }),
    supabaseServer.from("commissions").select("*", { count: "exact", head: true }).eq("status", "NEW"),
  ]);

  const cards = [
    { label: "Total Products", value: totalProducts || 0, color: "text-[#8ab4e8]" },
    { label: "Published", value: publishedProducts || 0, color: "text-emerald-400" },
    { label: "Commissions", value: totalCommissions || 0, color: "text-[#4a90d9]" },
    { label: "New Leads", value: newCommissions || 0, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="border border-[#0a1a3a] p-4 text-center bg-[#111]/50">
          <p className="text-[10px] text-[#3a5570] tracking-widest uppercase mb-2">{card.label}</p>
          <p className={`text-2xl font-serif ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}