"use client";

import { motion } from "framer-motion";

export default function EditorialHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#C5A880]"
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="font-serif font-light text-4xl md:text-6xl tracking-wide text-zinc-100"
      >
        {title}
      </motion.h1>
    </>
  );
}
