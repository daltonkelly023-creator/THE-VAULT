export default function BuyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8e4dc]">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center">
        <p className="text-[#c9a96e] text-sm tracking-[0.3em] uppercase mb-6">
          Atelier Vault — Agency Edition
        </p>
        <h1 className="text-5xl md:text-7xl font-light leading-tight max-w-4xl mb-8">
          The Luxury Brand Platform<br />
          <span className="text-[#c9a96e] italic">Built for Jewelry & Showrooms</span>
        </h1>
        <p className="text-[#888] text-lg max-w-2xl mb-12 leading-relaxed">
          A complete Next.js showroom with commission capture, admin dashboard, and ornate custom design. Deploy for your jewelry clients in 10 minutes.
        </p>
        <a 
          href="https:https://nexuslabscripts.lemonsqueezy.com/checkout/buy/f7538685-c4b8-4dd8-9f22-7a4039caa1a9"
          className="bg-[#c9a96e] text-[#0a0a0a] px-10 py-4 text-sm tracking-widest uppercase font-medium hover:bg-[#b8995e] transition-colors"
        >
          Buy Agency License — $999
        </a>
        <p className="text-[#555] text-xs mt-4 tracking-wide">
          One-time payment. Unlimited client projects. Lifetime updates.
        </p>
      </section>

      {/* Divider */}
      <div className="flex justify-center">
        <div className="w-24 h-px bg-[#c9a96e] opacity-40"></div>
      </div>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-16">
          What You Get
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {[
            { title: "Ornate SVG Corner Frames", desc: "Hand-crafted filigree scrollwork. Not generic CSS borders. Signals luxury instantly." },
            { title: "Commission System", desc: "Mandatory email validation. Zero external dependencies. Data flows to Supabase." },
            { title: "Protected Admin Dashboard", desc: "Password-locked with middleware auth. Real product management, not a mockup." },
            { title: "Custom Cursor & Interactions", desc: "Premium micro-interactions that boilerplates skip." },
            { title: "Product Configurator", desc: "Let visitors customize before they inquire. Higher quality leads." },
            { title: "One-Click Vercel Deploy", desc: "Clone, add env vars, push. Live in 10 minutes. Full docs included." }
          ].map((f, i) => (
            <div key={i} className="border border-[#222] p-8 hover:border-[#c9a96e] transition-colors">
              <h3 className="text-[#c9a96e] text-lg font-medium mb-3">{f.title}</h3>
              <p className="text-[#888] leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <div className="border border-[#c9a96e] p-10 md:p-16 max-w-2xl mx-auto relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c9a96e]"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#c9a96e]"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#c9a96e]"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#c9a96e]"></div>
          
          <p className="text-[#c9a96e] text-sm tracking-[0.3em] uppercase mb-4">One-Time Payment</p>
          <div className="text-6xl md:text-7xl font-light text-[#e8e4dc] mb-6">$999</div>
          <ul className="text-left text-[#888] space-y-3 mb-10 max-w-md mx-auto text-sm">
            <li className="flex items-center gap-3"><span className="text-[#c9a96e]">✦</span> Unlimited client projects</li>
            <li className="flex items-center gap-3"><span className="text-[#c9a96e]">✦</span> Full source code (Next.js + Supabase)</li>
            <li className="flex items-center gap-3"><span className="text-[#c9a96e]">✦</span> Lifetime updates</li>
            <li className="flex items-center gap-3"><span className="text-[#c9a96e]">✦</span> Private GitHub repo access</li>
            <li className="flex items-center gap-3"><span className="text-[#c9a96e]">✦</span> schema.sql + setup docs included</li>
            <li className="flex items-center gap-3"><span className="text-[#c9a96e]">✦</span> Placeholder images ready to swap</li>
          </ul>
          <a 
            href="https://nexuslabscripts.lemonsqueezy.com/checkout/buy/f7538685-c4b8-4dd8-9f22-7a4039caa1a9"
            className="inline-block bg-[#c9a96e] text-[#0a0a0a] px-12 py-4 text-sm tracking-widest uppercase font-medium hover:bg-[#b8995e] transition-colors"
          >
            Buy Now
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 max-w-3xl mx-auto border-t border-[#1a1a1a]">
        <h2 className="text-2xl font-light mb-12 text-center">Questions</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-[#c9a96e] text-sm tracking-widest uppercase mb-2">Can I use this for multiple clients?</h3>
            <p className="text-[#888] text-sm leading-relaxed">Yes. The Agency License covers unlimited client projects you manage. Each client gets their own deployed instance.</p>
          </div>
          <div>
            <h3 className="text-[#c9a96e] text-sm tracking-widest uppercase mb-2">Do I need my own Supabase?</h3>
            <p className="text-[#888] text-sm leading-relaxed">Yes. You create a free Supabase project, run the included schema.sql, and add your keys. Takes 5 minutes. Your data stays separate.</p>
          </div>
          <div>
            <h3 className="text-[#c9a96e] text-sm tracking-widest uppercase mb-2">What about images and content?</h3>
            <p className="text-[#888] text-sm leading-relaxed">All images are placeholders. Swap them for your client's assets. The structure and styling are production-ready.</p>
          </div>
          <div>
            <h3 className="text-[#c9a96e] text-sm tracking-widest uppercase mb-2">What tech stack?</h3>
            <p className="text-[#888] text-sm leading-relaxed">Next.js 14, TypeScript, Tailwind CSS, Supabase, Resend. Deploys to Vercel in one click.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a] py-12 text-center">
        <p className="text-[#444] text-xs tracking-widest uppercase">© 2026 Atelier Vault. All rights reserved.</p>
      </footer><p className="text-[#444] text-xs tracking-widest uppercase">
  © 2026 Omarian Alphanso Wright. All rights reserved.
</p>
    </main>
  );
}