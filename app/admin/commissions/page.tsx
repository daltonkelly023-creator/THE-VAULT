import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminCommissionsPage() {
  const { data: commissions } = await supabaseServer
    .from("commissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl text-[#c9a96e] tracking-[0.3em] uppercase font-light">Commissions Inbox</h1>
          <Link href="/admin" className="text-xs text-gray-500 hover:text-[#c9a96e] tracking-widest">← Back to Admin</Link>
        </div>

        {(!commissions || commissions.length === 0) ? (
          <div className="border border-[#1a1a1a] p-12 text-center text-gray-600">
            <p className="tracking-widest text-xs">No commissions yet. They will appear here + email via Resend.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commissions.map((c: any) => (
              <div key={c.id} className="border border-[#1a1a1a] bg-[#111]/50 p-6 flex flex-col md:flex-row md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex gap-3 items-center mb-2">
                    <p className="text-[#c9a96e] font-serif text-lg">{c.piece_name}</p>
                    <span className={`text-[10px] px-2 py-1 tracking-widest ${c.status === "NEW" ? "bg-[#c9a96e] text-black" : "bg-[#1a1a1a] text-gray-400"}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-gray-400">{c.name} — {c.email} — {new Date(c.created_at).toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mt-1">{c.collection} {c.metal ? `| ${c.metal}` : ""} {c.stone ? `| ${c.stone}` : ""} {c.price_cents ? `| $${(c.price_cents/100).toLocaleString()}` : ""}</p>
                  <p className="text-sm text-gray-300 mt-4 leading-relaxed bg-[#0a0a0a] p-3 border border-[#1a1a1a]/50">{c.message || "No message"}</p>
                </div>
                <div className="flex md:flex-col gap-2">
                  <a href={`mailto:${c.email}`} className="text-xs border border-[#c9a96e] text-[#c9a96e] px-4 py-2 tracking-widest hover:bg-[#c9a96e] hover:text-black transition-colors text-center">REPLY</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}