"use client";

import { TerraAssay } from "@/lib/terraData";
import { useScrambleText } from "@/lib/useScrambleText";

const LAYER_COLORS = ["#5C6B4F", "#8C6F4F", "#3D2F22", "#B99B72", "#231C1A"];

export default function StrataLine({ assay, revision }: { assay: TerraAssay; revision: number }) {
  const carat = useScrambleText(assay.carat);
  const clarity = useScrambleText(assay.clarity);
  const value = useScrambleText(assay.estValue);
  const age = useScrambleText(assay.formationAge);
  const provenanceId = useScrambleText(assay.provenanceId);

  return (
    <div className="strata-line" aria-live="polite">
      <div className="strata-row strata-row--head">
        <span>FIELD NOTES</span>
        <span>SAMPLE {String(revision).padStart(3, "0")}</span>
      </div>

      {/* rock-layer band, purely decorative but load-bearing for the signature feel */}
      <div
        style={{
          display: "flex",
          height: 10,
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        {LAYER_COLORS.map((c, i) => (
          <div key={i} style={{ background: c, flex: 1, opacity: 0.85 }} />
        ))}
      </div>

      <div className="assay-grid">
        <div className="assay-cell">
          <span className="assay-label">Carat</span>
          <span className="assay-value">{carat}</span>
        </div>
        <div className="assay-cell">
          <span className="assay-label">Formed</span>
          <span className="assay-value">{age}</span>
        </div>
        <div className="assay-cell">
          <span className="assay-label">Clarity</span>
          <span className="assay-value">{clarity}</span>
        </div>
        <div className="assay-cell assay-cell--value">
          <span className="assay-label">Est. Value</span>
          <span className="assay-value assay-value--emphasis">{value}</span>
        </div>
      </div>

      <div className="assay-row assay-row--foot">
        <span>{provenanceId}</span>
      </div>
    </div>
  );
}