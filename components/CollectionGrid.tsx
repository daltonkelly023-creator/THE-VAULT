"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Piece } from "@/lib/products";
import PiecePlaceholder from "@/components/PiecePlaceholder";

/** Listing thumbnails are always the static hero photo — even for pieces
 *  with a full 3D/turntable experience. The heavier viewer only loads on
 *  the detail page, per the Aston Martin configurator pattern (§3 of the
 *  handoff doc): static on the grid, full experience on click-through. */
export default function CollectionGrid({ pieces }: { pieces: Piece[] }) {
  return (
    <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {pieces.map((piece, index) => (
        <motion.div
          key={piece.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.15 }}
        >
          <Link href={`/collection/${piece.id}`} className="group block space-y-5">
            <div className="aspect-[4/5] w-full overflow-hidden bg-[#0D0D0D] border border-zinc-900/60 relative flex items-center justify-center transition-all duration-500 group-hover:border-zinc-800">
              <div className="absolute inset-0 vault-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              {piece.heroImageUrl ? (
                <Image
                  src={piece.heroImageUrl}
                  alt={piece.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <PiecePlaceholder />
              )}
            </div>

            <div className="space-y-1 px-1">
              <div className="flex justify-between items-baseline">
                <h3 className="font-serif font-light text-xl tracking-wide text-zinc-200 group-hover:text-white transition-colors">
                  {piece.name}
                </h3>
                <p className="text-sm font-light text-zinc-400 tracking-wider">{piece.priceLabel}</p>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#C5A880]">
                {piece.material}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </section>
  );
}
