"use client";

import * as React from "react";
import { VAULT_COLLECTION } from "@/data/collection";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import PiecePlaceholder from "@/components/PiecePlaceholder";

export default function PrivateViewingRoom({ params }: { params: Promise<{ id: string }> }) {
  // Safe unwrap for Next.js 15 client-side parameter handling
  const resolvedParams = React.use(params);
  const piece = VAULT_COLLECTION.find((item) => item.id === resolvedParams.id);

  if (!piece) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-zinc-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT CANVAS: Split Media Column — Locked Sticky Desktop Placement Viewport */}
        <section className="w-full lg:w-[55%] lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] bg-[#070707] overflow-hidden flex items-center justify-center border-b lg:border-b-0 lg:border-r border-zinc-900/60 relative">
          <div className="absolute inset-0 vault-spotlight" />

          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full w-full max-h-[60vh] lg:max-h-full"
          >
            <PiecePlaceholder label="Rendering Pending" />
          </motion.div>
        </section>

        {/* RIGHT CANVAS: The Bespoke Product Dossier Editorial Sheet */}
        <section className="w-full lg:w-[45%] p-8 md:p-16 lg:p-20 flex flex-col justify-between bg-[#0A0A0A]">
          {/* Section Breadcrumb Return Back Pathway */}
          <div className="mb-12">
            <Link href="/collection" className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 hover:text-[#C5A880] transition-colors duration-300">
              ← Return to Showroom
            </Link>
          </div>

          {/* Central Information Narrative Assembly Blocks */}
          <div className="space-y-10 my-auto max-w-lg mx-auto lg:mx-0">
            <div className="space-y-3">
              <motion.p
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#C5A880]"
              >
                Inquire Collection Spec
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-serif font-light text-3xl md:text-4xl lg:text-5xl tracking-wide text-zinc-100 leading-tight"
              >
                {piece.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="font-sans font-light text-2xl text-zinc-400 tracking-wider pt-1"
              >
                {piece.price}
              </motion.p>
            </div>

            <hr className="border-zinc-900" />

            {/* Design & Concept Story Paragraph Section */}
            <div className="space-y-4">
              <h4 className="text-[11px] uppercase tracking-[0.2em] font-medium text-zinc-400">The Narrative</h4>
              <p className="text-sm font-light leading-relaxed text-zinc-400 font-sans">
                {piece.story}
              </p>
            </div>

            <hr className="border-zinc-900" />

            {/* Micro Composition Specifications Key Matrix Layout */}
            <div className="space-y-4">
              <h4 className="text-[11px] uppercase tracking-[0.2em] font-medium text-zinc-400">Material Integrity</h4>
              <div className="grid grid-cols-2 gap-y-3 border-b border-zinc-900 pb-4 text-xs font-light text-zinc-500">
                <div>Composition</div>
                <div className="text-zinc-300 text-right font-sans">{piece.material}</div>
                <div>Primary Setting</div>
                <div className="text-zinc-300 text-right font-sans">{piece.stone}</div>
                <div>Carat Metrics</div>
                <div className="text-zinc-300 text-right font-sans">{piece.carat}</div>
              </div>

              {/* Bulleted High-End Detail Accents */}
              <ul className="space-y-2 pt-2">
                {piece.specifications.map((spec, i) => (
                  <li key={i} className="text-[11px] text-zinc-400 flex items-start space-x-2">
                    <span className="text-[#C5A880] mt-0.5">▪</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Core Acquisition Transactional Interface Block Footer */}
          <div className="mt-16 pt-8 border-t border-zinc-900 max-w-lg mx-auto lg:mx-0 w-full space-y-4">
            <button className="w-full py-4 bg-transparent border border-zinc-800 text-zinc-200 text-xs font-medium uppercase tracking-[0.25em] transition-all duration-500 hover:border-[#C5A880] hover:text-white hover:shadow-[0_0_30px_rgba(197,168,128,0.08)] bg-[#0B0B0B]">
              Request Private Viewing
            </button>
            <p className="text-center text-[10px] text-zinc-600 tracking-widest uppercase">
              Includes complimentary insured overnight armored signature courier delivery
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}