"use client";

import Image from "next/image";
import { Piece } from "@/lib/products";
import PiecePlaceholder from "@/components/PiecePlaceholder";
import TurntableViewer from "@/components/TurntableViewer";
import GlbViewer from "@/components/GlbViewer";
import RingCanvas from "@/components/RingCanvas";
import { METALS, CUTS, SETTINGS, ATMOSPHERES } from "@/lib/ringData";
import { TERRA_ATMOSPHERES } from "@/lib/terraData";

/** Single entry point for "however this piece is meant to be looked at."
 *  Point of this component: the detail page shouldn't need to know or care
 *  whether a piece is a live parametric render, a photo turntable set, a
 *  real .glb model, or just a hero photo — it just renders <PieceViewer />.
 */
export default function PieceViewer({ piece }: { piece: Piece }) {
  switch (piece.assetType) {
    case "parametric": {
      // Parametric pieces don't have their own stored cut/setting/atmosphere
      // yet (only `metal`), so this renders the piece's actual metal against
      // sensible defaults rather than the full interactive configurator —
      // the configurator itself lives on the homepage for building a piece
      // from scratch. Flag to revisit once cut/setting are stored per-piece.
      const metal = METALS.find((m) => m.id === piece.material) ?? METALS[0];
      const atmospheres = piece.collection === "terra" ? TERRA_ATMOSPHERES : ATMOSPHERES;
      return (
        <RingCanvas
          metal={metal}
          cut={CUTS[0]}
          setting={SETTINGS[0]}
          atmosphere={atmospheres[0]}
          ground={piece.collection === "terra"}
        />
      );
    }

    case "turntable":
      if (piece.turntableFrameUrls.length > 0) {
        return <TurntableViewer frameUrls={piece.turntableFrameUrls} alt={piece.name} />;
      }
      return <PiecePlaceholder label="Turntable Pending" />;

    case "model3d":
      if (piece.model3dUrl) {
        return (
          <GlbViewer
            modelUrl={piece.model3dUrl}
            backgroundHex={piece.collection === "terra" ? 0x110e0c : 0x0a0908}
          />
        );
      }
      return <PiecePlaceholder label="Rendering Pending" />;

    case "photo_only":
    default:
      return (
        <Image
          src={piece.heroImageUrl}
          alt={piece.name}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-contain"
          priority
        />
      );
  }
}
