import { supabase } from "@/lib/supabaseServer";
import Link from "next/link";
import Particles from "@/components/Particles";
import AnimatedSection from "@/components/AnimatedSection";
import PressLogos from "@/components/PressLogos";

export const revalidate = 0;

export default async function HomePage() {
  const { data: pieces } = await supabase
    .from("products")
    .select("id, name, category, hero_image_path, price_cents, collection")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const heroPiece = pieces?.[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <Particles />

      {/* NAV — Only Showroom + Commission */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]/50 backdrop-blur-sm bg-[#0a0a0a]/80">
        <Link href="/" className="text-[#c9a96e] text-sm tracking-[0.4em] font-light uppercase">
          Atelier
        </Link>
        <nav className="flex gap-8 text-xs tracking-[0.2em] text-gray-500">
          <Link href="/collection" className="hover:text-[#c9a96e] transition-colors">Showroom</Link>
          <Link href="/commission" className="hover:text-[#c9a96e] transition-colors">Commission</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="h-screen w-full relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroPiece?.hero_image_path ? (
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${heroPiece.hero_image_path}`}
              alt={heroPiece.name}
              className="w-full h-full object-cover opacity-30 scale-110"
            />
          ) : (
            <div className="w-full h-full bg-[#0a0a0a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]/90" />
        </div>

        <div className="relative z-10 text-center px-4">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-8">
              {heroPiece?.collection === "altera" ? "Atelier — Workshop Crafted" : "Terra — Earth Sourced"}
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="relative inline-block">
              <h1 
                className="text-[18vw] md:text-[14vw] font-light tracking-[0.12em] leading-none select-none"
                style={{
                  backgroundImage: heroPiece?.hero_image_path 
                    ? `url(${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${heroPiece.hero_image_path})`
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                  filter: 'brightness(1.3) contrast(1.1)',
                }}
              >
                THE VAULT
              </h1>
              {!heroPiece?.hero_image_path && (
                <h1 className="text-[18vw] md:text-[14vw] font-light tracking-[0.12em] text-[#c9a96e] leading-none absolute inset-0">
                  THE VAULT
                </h1>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.5}>
            <p className="mt-10 text-gray-400 text-sm tracking-[0.2em] max-w-md mx-auto leading-relaxed">
              Bespoke jewelry, forged to order. Configure your piece and commission directly.
            </p>
          </AnimatedSection>

          {/* MOVED DOWN — more margin-top */}
          <AnimatedSection delay={0.7}>
            <div className="mt-16">
              <Link
                href="/collection"
                className="magnetic-button inline-block px-12 py-5 border border-[#c9a96e] text-[#c9a96e] text-xs tracking-[0.3em] uppercase hover:bg-[#c9a96e] hover:text-[#0a0a0a] transition-all duration-700"
              >
                Enter the Showroom
              </Link>
            </div>
          </AnimatedSection>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-[10px] text-gray-600 tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#c9a96e] to-transparent animate-pulse" />
        </div>
      </section>

      {/* COLLECTION PREVIEW */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-xs tracking-[0.3em] text-gray-500 uppercase">Latest Pieces</h2>
            <Link href="/collection" className="text-xs text-[#c9a96e] tracking-widest hover:text-[#b8985d] transition-colors">
              VIEW ALL →
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pieces?.map((piece, i) => (
            <AnimatedSection key={piece.id} delay={i * 0.15}>
              <Link href={`/piece/${piece.id}`} className="group block">
                <div className="aspect-[3/4] bg-[#111] border border-[#1a1a1a] overflow-hidden relative">
                  {piece.hero_image_path ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${piece.hero_image_path}`}
                      alt={piece.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">{piece.name}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-[10px] text-[#c9a96e] tracking-widest uppercase">View Piece</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm tracking-wider text-white group-hover:text-[#c9a96e] transition-colors">{piece.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{piece.category}</p>
                  <p className="text-sm text-[#c9a96e] mt-2">${(piece.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="py-32 px-8 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <div className="aspect-[4/5] bg-[#111] border border-[#1a1a1a] overflow-hidden">
              <img src="/brand-story.jpg" alt="Craftsmanship" className="w-full h-full object-cover opacity-80" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="space-y-8">
              <p className="text-[10px] tracking-[0.5em] text-[#c9a96e] uppercase">The Atelier</p>
              <h2 className="text-4xl font-light tracking-wider leading-tight">
                Where Raw Earth<br />Meets Human Hand
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Every piece begins as a conversation. Between the stone and the setting, 
                the metal and the maker, the vision and the wearer. We do not mass-produce. 
                We do not repeat. Each commission is a singular event.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                Our atelier in Mayfair has served collectors, architects, and inheritors 
                for three generations. The work speaks for itself. The silence between 
                words is where trust lives.
              </p>
              <Link href="/commission" className="inline-block text-xs text-[#c9a96e] tracking-widest uppercase border-b border-[#c9a96e]/30 pb-1 hover:border-[#c9a96e] transition-colors">
                Commission a Piece →
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* VIDEO */}
      <section className="py-32 px-8 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.5em] text-[#c9a96e] uppercase mb-6">The Process</p>
            <h2 className="text-3xl font-light tracking-wider mb-4">The Art of Creation</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto mb-12">
              From rough stone to finished piece. Each stage documented, each decision intentional.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="relative aspect-video bg-[#111] border border-[#1a1a1a] rounded overflow-hidden group">
              <video autoPlay muted loop playsInline poster="/video-poster.jpg" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700">
                <source src="/craftsmanship.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-[#c9a96e]/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-[#c9a96e] border-b-8 border-b-transparent ml-1" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6">
                <p className="text-[10px] text-gray-500 tracking-widest uppercase">Watch the process</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* PRESS */}
      <section className="py-24 px-8 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.5em] text-gray-600 uppercase mb-12">As Featured In</p>
            <PressLogos />
          </AnimatedSection>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-32 px-8 border-t border-[#1a1a1a]">
        <div className="max-w-xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.5em] text-[#c9a96e] uppercase mb-6">Private Access</p>
            <h2 className="text-2xl font-light tracking-wider mb-4">Join the Inner Circle</h2>
            <p className="text-gray-500 text-sm mb-10">
              New pieces, private viewings, and commission openings. No frequency, no noise. 
              Only when it matters.
            </p>
            <form className="flex gap-4">
              <input type="email" placeholder="your@email.com" className="flex-1 bg-[#111] border border-[#1a1a1a] rounded px-6 py-4 text-sm text-white placeholder-gray-600 focus:border-[#c9a96e] outline-none transition-colors" />
              <button type="submit" className="px-8 py-4 bg-[#c9a96e] text-black text-xs tracking-widest uppercase font-medium rounded hover:bg-[#b8985d] transition-colors">Subscribe</button>
            </form>
            <p className="text-gray-700 text-[10px] mt-4 tracking-wider">Unsubscribe anytime. We never share your data.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h4 className="text-[#c9a96e] text-sm tracking-[0.4em] uppercase mb-4">Atelier</h4>
            <p className="text-gray-600 text-xs leading-relaxed">Bespoke jewelry, forged to order. Each piece commissioned individually. No two are alike.</p>
          </div>
          <div>
            <h5 className="text-gray-500 text-xs tracking-[0.2em] uppercase mb-4">Contact</h5>
            <p className="text-gray-600 text-xs leading-relaxed">inquiries@atelier.vault<br />+1 (555) 234-5678<br />By appointment only</p>
          </div>
          <div>
            <h5 className="text-gray-500 text-xs tracking-[0.2em] uppercase mb-4">Showroom</h5>
            <p className="text-gray-600 text-xs leading-relaxed">47 Bond Street<br />Mayfair, London W1S 1DE<br />United Kingdom</p>
          </div>
          <div>
            <h5 className="text-gray-500 text-xs tracking-[0.2em] uppercase mb-4">Follow</h5>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-gray-600 hover:text-[#c9a96e] text-xs transition-colors">Instagram</a>
              <a href="#" className="text-gray-600 hover:text-[#c9a96e] text-xs transition-colors">Pinterest</a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-700 hover:text-gray-500 text-[10px] transition-colors">Privacy</a>
              <a href="#" className="text-gray-700 hover:text-gray-500 text-[10px] transition-colors">Terms</a>
            </div>
            <Link href="/admin" className="text-gray-800 hover:text-gray-600 text-[10px] transition-colors mt-4 block tracking-widest">Staff Access</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#1a1a1a] flex justify-between items-center">
          <span className="text-gray-700 text-[10px] tracking-widest">© 2024 Atelier. All rights reserved.</span>
          <span className="text-gray-800 text-[10px] tracking-widest">Crafted with intention</span>
        </div>
      </footer>
    </div>
  );
}