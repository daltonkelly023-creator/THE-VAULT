"use client";

import { CollectionKind } from "@/lib/ringData";
import { playSelectClick } from "@/lib/sound";

export default function CollectionToggle({
  value,
  onChange,
}: {
  value: CollectionKind;
  onChange: (v: CollectionKind) => void;
}) {
  return (
    <div className="collection-toggle" role="tablist" aria-label="Stone collection">
      {(["atelier", "terra"] as CollectionKind[]).map((kind) => (
        <button
          key={kind}
          type="button"
          role="tab"
          aria-selected={value === kind}
          className={`collection-toggle__btn ${value === kind ? "collection-toggle__btn--active" : ""}`}
          onClick={() => {
            if (kind !== value) {
              playSelectClick();
              onChange(kind);
            }
          }}
        >
          {kind === "atelier" ? "Atelier" : "Terra"}
        </button>
      ))}
    </div>
  );
}