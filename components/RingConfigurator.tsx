"use client";

import { useCallback, useMemo, useState } from "react";
import {
  METALS,
  CUTS,
  SETTINGS,
  ATMOSPHERES,
  MetalOption,
  CutOption,
  SettingOption,
  AtmosphereOption,
  CollectionKind,
  computeAssay,
} from "@/lib/ringData";
import { TERRA_CUTS, TERRA_ATMOSPHERES, computeTerraAssay } from "@/lib/terraData";
import RingCanvas from "./RingCanvas";
import ControlPanel from "./ControlPanel";
import AssayTicker from "./AssayTicker";
import StrataLine from "./StrataLine";
import CollectionToggle from "./CollectionToggle";
import LoadingScreen from "./LoadingScreen";
import EmberField from "./EmberField";

export default function RingConfigurator() {
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<CollectionKind>("atelier");

  const [metal, setMetal] = useState<MetalOption>(METALS[0]);
  const [cut, setCut] = useState<CutOption>(CUTS[0]);
  const [setting, setSetting] = useState<SettingOption>(SETTINGS[0]);
  const [atmosphere, setAtmosphere] = useState<AtmosphereOption>(ATMOSPHERES[0]);
  const [revision, setRevision] = useState(1);

  // --- Mouse Tracking for Atmospheric Spotlights ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    setMousePos({ x: e.clientX, y: e.clientY });
  }

  const bump = useCallback(() => setRevision((r) => r + 1), []);

  const activeCuts = collection === "atelier" ? CUTS : TERRA_CUTS;
  const activeAtmospheres = collection === "atelier" ? ATMOSPHERES : TERRA_ATMOSPHERES;

  const activeCut = useMemo(
    () => activeCuts.find((c) => c.id === cut.id) ?? activeCuts[0],
    [activeCuts, cut.id]
  );
  const activeAtmosphere = useMemo(
    () => activeAtmospheres.find((a) => a.id === atmosphere.id) ?? activeAtmospheres[0],
    [activeAtmospheres, atmosphere.id]
  );

  function handleCollectionChange(next: CollectionKind) {
    setCollection(next);
    setCut((next === "atelier" ? CUTS : TERRA_CUTS)[0]);
    setAtmosphere((next === "atelier" ? ATMOSPHERES : TERRA_ATMOSPHERES)[0]);
    bump();
  }

  const assay = collection === "atelier" ? computeAssay(metal, activeCut, setting) : null;
  const terraAssay = collection === "terra" ? computeTerraAssay(metal, activeCut, setting) : null;

  // --- Dynamic Background Layers ---
  // Atelier: Clean, deep obsidian with a subtle gold hover reflection
  const atelierBackground = `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(197, 168, 128, 0.05), transparent 80%), #0A0A0A`;
  
  // Terra: Gritty SVG noise overlay with a faint bronze/earth tone hover glow
  const terraBackground = `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(140, 111, 79, 0.08), transparent 70%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"), #110E0C`;

  return (
    <div 
      className="atelier"
      onMouseMove={handleMouseMove}
      style={{
        background: collection === "atelier" ? atelierBackground : terraBackground,
        transition: 'background 700ms ease',
        minHeight: '100vh'
      }}
    >
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      <header className="atelier-header">
        <span className="atelier-header__mark">ATELIER&nbsp;No.&nbsp;001</span>
        <span className="atelier-header__product">The Commissioning Room</span>
        <CollectionToggle value={collection} onChange={handleCollectionChange} />
      </header>

      <div className="atelier-body">
        {/* Made the wrapper background transparent so the dynamic background shines through */}
        <div className="atelier-canvas-wrap" style={{ background: 'transparent', borderColor: collection === "terra" ? 'rgba(140, 111, 79, 0.14)' : 'rgba(197, 168, 128, 0.14)' }}>
          {assay && <AssayTicker assay={assay} revision={revision} />}
          {terraAssay && <StrataLine assay={terraAssay} revision={revision} />}
          
          <EmberField 
            atmosphere={activeAtmosphere} 
            collection={collection} 
          />
          
          <RingCanvas
            metal={metal}
            cut={activeCut}
            setting={setting}
            atmosphere={activeAtmosphere}
            ground={collection === "terra"}
          />
        </div>

        <ControlPanel
          metal={metal}
          cut={activeCut}
          cuts={activeCuts}
          setting={setting}
          atmosphere={activeAtmosphere}
          atmospheres={activeAtmospheres}
          onMetal={(m) => {
            setMetal(m);
            bump();
          }}
          onCut={(c) => {
            setCut(c);
            bump();
          }}
          onSetting={(s) => {
            setSetting(s);
            bump();
          }}
          onAtmosphere={(a) => {
            setAtmosphere(a);
            bump();
          }}
        />
      </div>
    </div>
  );
}