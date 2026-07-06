"use client";

import { VAULT_COLLECTION } from "@/data/collection";
import { motion } from "framer-motion";
import Link from "next/link";
import PiecePlaceholder from "@/components/PiecePlaceholder";

export default function ShowroomGallery() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-16 md:py-24">
      {/* Editorial Title Block */}
      <section className="max-w-7xl mx-auto mb-16 md:mb-24 text-center md:text-left space-y-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#C5A880]"
        >
          Curated Exhibition
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif font-light text-4xl md:text-6xl tracking-wide text-zinc-100"
        >
          The Permanent Collection
        </motion.h1>
      </section>

      {/* Spacious Luxury Product Grid */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {VAULT_COLLECTION.map((piece, index) => (
          <motion.div
            key={piece.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.15 }}
          >
            <Link href={`/collection/${piece.id}`} className="group block space-y-5">
              {/* Showcase Frame acting like an isolated display box */}
              <div className="aspect-[4/5] w-full overflow-hidden bg-[#0D0D0D] border border-zinc-900/60 relative flex items-center justify-center transition-all duration-500 group-hover:border-zinc-800">
                <div className="absolute inset-0 vault-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <PiecePlaceholder />
              </div>

              {/* Minimal Text Information Matrix Block */}
              <div className="space-y-1 px-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif font-light text-xl tracking-wide text-zinc-200 group-hover:text-white transition-colors">
                    {piece.name}
                  </h3>
                  <p className="text-sm font-light text-zinc-400 tracking-wider">
                    {piece.price}
                  </p>
                </div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#C5A880]">
                  {piece.material}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>
    </main>
  );
}