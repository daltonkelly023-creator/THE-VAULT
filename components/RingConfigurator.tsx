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

export default function RingConfigurator() {
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<CollectionKind>("atelier");

  const [metal, setMetal] = useState<MetalOption>(METALS[0]);
  const [cut, setCut] = useState<CutOption>(CUTS[0]);
  const [setting, setSetting] = useState<SettingOption>(SETTINGS[0]);
  const [atmosphere, setAtmosphere] = useState<AtmosphereOption>(ATMOSPHERES[0]);
  const [revision, setRevision] = useState(1);

  const bump = useCallback(() => setRevision((r) => r + 1), []);

  const activeCuts = collection === "atelier" ? CUTS : TERRA_CUTS;
  const activeAtmospheres = collection === "atelier" ? ATMOSPHERES : TERRA_ATMOSPHERES;

  // cut/atmosphere ids are shared types, but the option objects differ per
  // collection — keep whatever's selected in sync when the id still exists
  // in the new collection, otherwise fall back to that collection's first.
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

  return (
    <div className="atelier">
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      <header className="atelier-header">
        <span className="atelier-header__mark">ATELIER&nbsp;No.&nbsp;001</span>
        <span className="atelier-header__product">The Commissioning Room</span>
        <CollectionToggle value={collection} onChange={handleCollectionChange} />
      </header>

      <div className="atelier-body">
        <div className="atelier-canvas-wrap">
          {assay && <AssayTicker assay={assay} revision={revision} />}
          {terraAssay && <StrataLine assay={terraAssay} revision={revision} />}
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