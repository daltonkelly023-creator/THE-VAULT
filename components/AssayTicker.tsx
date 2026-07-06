"use client";

import { Assay } from "@/lib/ringData";
import { useScrambleText } from "@/lib/useScrambleText";

export default function AssayTicker({ assay, revision }: { assay: Assay; revision: number }) {
  const carat = useScrambleText(assay.carat);
  const cutLabel = useScrambleText(assay.cutLabel);
  const clarity = useScrambleText(assay.clarity);
  const value = useScrambleText(assay.estValue);
  const certId = useScrambleText(assay.certId);

  return (
    <div className="assay-ticker" aria-live="polite">
      <div className="assay-row assay-row--head">
        <span>ASSAY CERTIFICATE</span>
        <span>REV. {String(revision).padStart(3, "0")}</span>
      </div>
      <div className="assay-grid">
        <div className="assay-cell">
          <span className="assay-label">Carat</span>
          <span className="assay-value">{carat}</span>
        </div>
        <div className="assay-cell">
          <span className="assay-label">Cut</span>
          <span className="assay-value">{cutLabel}</span>
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
        <span>{certId}</span>
      </div>
    </div>
  );
}
