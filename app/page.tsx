import RingConfigurator from "@/components/RingConfigurator";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0c0a08] text-[#ede6d8]">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#c9a66b_0.8px,transparent_1px)] bg-[length:40px_40px] opacity-10"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-7xl md:text-8xl font-display italic tracking-tight mb-6">
            The Commissioning Room
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-[#a69c8c]">Bespoke jewelry. Crafted in silence. Worn with purpose.</p>
          <Link 
            href="#configurator"
            className="inline-block bg-[#6b1e20] hover:bg-[#8a2a2c] transition-colors px-12 py-5 text-sm tracking-[0.12em] uppercase font-medium"
          >
            Begin Your Commission
          </Link>
        </div>
      </section>

      <RingConfigurator />
    </div>
  );
}