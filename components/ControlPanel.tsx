"use client";

import {
  METALS,
  SETTINGS,
  MetalOption,
  CutOption,
  SettingOption,
  AtmosphereOption,
} from "@/lib/ringData";
import { playSelectClick, playConfirmThunk } from "@/lib/sound";
import MagneticButton from "./MagneticButton";

interface ControlPanelProps {
  metal: MetalOption;
  cut: CutOption;
  cuts: CutOption[];
  setting: SettingOption;
  atmosphere: AtmosphereOption;
  atmospheres: AtmosphereOption[];
  onMetal: (m: MetalOption) => void;
  onCut: (c: CutOption) => void;
  onSetting: (s: SettingOption) => void;
  onAtmosphere: (a: AtmosphereOption) => void;
}

export default function ControlPanel({
  metal,
  cut,
  cuts,
  setting,
  atmosphere,
  atmospheres,
  onMetal,
  onCut,
  onSetting,
  onAtmosphere,
}: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <section className="control-group">
        <h2 className="control-group__title">Metal</h2>
        <div className="swatch-row">
          {METALS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`swatch ${metal.id === m.id ? "swatch--active" : ""}`}
              style={{ background: `linear-gradient(155deg, ${m.gradientStops[0]}, ${m.gradientStops[2]})` }}
              aria-label={m.label}
              aria-pressed={metal.id === m.id}
              onClick={() => {
                playSelectClick();
                onMetal(m);
              }}
            />
          ))}
        </div>
        <p className="control-group__caption">{metal.label}</p>
      </section>

      <section className="control-group">
        <h2 className="control-group__title">Cut</h2>
        <div className="option-row">
          {cuts.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`option-chip ${cut.id === c.id ? "option-chip--active" : ""}`}
              aria-pressed={cut.id === c.id}
              onClick={() => {
                playSelectClick();
                onCut(c);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="control-group">
        <h2 className="control-group__title">Setting</h2>
        <div className="option-list">
          {SETTINGS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`option-line ${setting.id === s.id ? "option-line--active" : ""}`}
              aria-pressed={setting.id === s.id}
              onClick={() => {
                playSelectClick();
                onSetting(s);
              }}
            >
              <span className="option-line__label">{s.label}</span>
              <span className="option-line__desc">{s.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="control-group">
        <h2 className="control-group__title">Atmosphere</h2>
        <div className="atmosphere-toggle">
          {atmospheres.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`atmosphere-btn ${atmosphere.id === a.id ? "atmosphere-btn--active" : ""}`}
              aria-pressed={atmosphere.id === a.id}
              onClick={() => {
                playSelectClick();
                onAtmosphere(a);
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <p className="control-group__caption">{atmosphere.description}</p>
      </section>

      <MagneticButton className="commission-cta" strength={10} onClick={() => playConfirmThunk()}>
        Request the Commission
      </MagneticButton>
    </aside>
  );
}