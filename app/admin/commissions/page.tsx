import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";

export const revalidate = 0;

function parseCommissionMessage(msg: string) {
  if (!msg) return { configLines: [], notes: "" };
  
  const parts = msg.split("Additional notes:");
  const configSection = parts[0] || "";
  const notes = parts[1]?.trim() || "";
  
  // Parse config lines (skip the "Configuration Request for X" header)
  const lines = configSection
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith("Configuration Request for"));
  
  return { configLines: lines, notes };
}

export default async function AdminCommissionsPage() {
  const { data: commissions } = await supabaseServer
    .from("commissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl text-[#c9a96e] tracking-[0.3em] uppercase font-light">
            Commissions Inbox
          </h1>
          <Link
            href="/admin"
            className="text-xs text-gray-500 hover:text-[#c9a96e] tracking-widest"
          >
            ← Back to Admin
          </Link>
        </div>

        {(!commissions || commissions.length === 0) ? (
          <div className="border border-[#1a1a1a] p-12 text-center text-gray-600">
            <p className="tracking-widest text-xs">
              No commissions yet. They will appear here + email via Resend.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {commissions.map((c: any) => {
              const { configLines, notes } = parseCommissionMessage(c.message);
              const mailtoLink = `mailto:${c.email}?subject=${encodeURIComponent(
                `Re: Your ${c.piece_name || "Commission"} Request`
              )}&body=${encodeURIComponent(`Hi ${c.name},\n\n`)}`;

              return (
                <div
                  key={c.id}
                  className="border border-[#1a1a1a] bg-[#111]/50 p-6 md:p-8"
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-[#1a1a1a]">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-[#c9a96e] font-serif text-xl">
                          {c.piece_name}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-1 tracking-widest ${
                            c.status === "NEW"
                              ? "bg-[#c9a96e] text-black"
                              : "bg-[#1a1a1a] text-gray-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {c.name} — {c.email}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(c.created_at).toLocaleString()} — {c.collection}
                        {c.metal ? ` | ${c.metal}` : ""}
                        {c.stone ? ` | ${c.stone}` : ""}
                        {c.price_cents
                          ? ` | $${(c.price_cents / 100).toLocaleString()}`
                          : ""}
                      </p>
                    </div>

                    {/* REPLY — Fixed with proper target */}
                    <a
                      href={mailtoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs border border-[#c9a96e] text-[#c9a96e] px-6 py-3 tracking-widest hover:bg-[#c9a96e] hover:text-black transition-colors text-center inline-block"
                    >
                      REPLY
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Selected Configuration */}
                    <div>
                      <h3 className="text-[10px] tracking-widest text-gray-500 uppercase mb-4">
                        Selected Configuration
                      </h3>
                      {configLines.length > 0 ? (
                        <div className="space-y-2">
                          {configLines.map((line, i) => {
                            const [label, ...valueParts] = line.split(":");
                            const value = valueParts.join(":").trim();
                            return (
                              <div
                                key={i}
                                className="flex justify-between items-center py-2 border-b border-[#1a1a1a]/50"
                              >
                                <span className="text-xs text-gray-500 capitalize">
                                  {label?.trim()}
                                </span>
                                <span className="text-xs text-[#8ab4e8]">
                                  {value || "—"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">No configuration data.</p>
                      )}
                    </div>

                    {/* Client Notes */}
                    <div>
                      <h3 className="text-[10px] tracking-widest text-gray-500 uppercase mb-4">
                        Client Notes
                      </h3>
                      {notes ? (
                        <p className="text-sm text-gray-300 leading-relaxed bg-[#0a0a0a] p-4 border border-[#1a1a1a]/50">
                          {notes}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 italic">No additional notes.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}