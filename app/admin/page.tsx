"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Category = "necklace" | "bracelet" | "earring" | "ring" | "watch";
type Collection = "atelier" | "terra";
type AssetType = "parametric" | "turntable" | "model3d" | "photo_only";

const CATEGORIES: Category[] = ["necklace", "bracelet", "earring", "ring", "watch"];
const METALS = ["yellow-gold", "rose-gold", "platinum", "blackened"];

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return <div className="admin-shell admin-shell--center">Checking access...</div>;
  }

  return session ? <ProductForm /> : <SignIn />;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="admin-shell admin-shell--center">
      <form onSubmit={handleSignIn} className="admin-panel">
        <h1 className="admin-title">Archive Access</h1>
        <p className="admin-sub">Sign in to manage the collection.</p>

        <label className="admin-label">Email</label>
        <input
          className="admin-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="admin-label">Password</label>
        <input
          className="admin-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="admin-cta" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <style jsx>{ADMIN_STYLES}</style>
    </div>
  );
}

function ProductForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("ring");
  const [collection, setCollection] = useState<Collection>("atelier");
  const [priceDollars, setPriceDollars] = useState("");
  const [description, setDescription] = useState("");
  const [metal, setMetal] = useState(METALS[0]);
  const [assetType, setAssetType] = useState<AssetType>("photo_only");
  const [isPublished, setIsPublished] = useState(false);

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [turntableFiles, setTurntableFiles] = useState<FileList | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setStatusMessage("");

    try {
      if (!heroFile) throw new Error("A hero image is required for every piece, even parametric ones.");

      // 1. Upload hero image — always required, used for listing thumbnails.
      const heroPath = `hero/${crypto.randomUUID()}-${heroFile.name}`;
      const { error: heroErr } = await supabase.storage.from("vault-assets").upload(heroPath, heroFile);
      if (heroErr) throw heroErr;

      // 2. Conditionally upload turntable set or 3D model.
      let turntableFolderPath: string | null = null;
      let model3dPath: string | null = null;

      if (assetType === "turntable" && turntableFiles && turntableFiles.length > 0) {
        const folderId = crypto.randomUUID();
        turntableFolderPath = `turntables/${folderId}/`;
        const uploads = Array.from(turntableFiles).map((file, i) => {
          const framePath = `${turntableFolderPath}${String(i).padStart(3, "0")}-${file.name}`;
          return supabase.storage.from("vault-assets").upload(framePath, file);
        });
        const results = await Promise.all(uploads);
        const failed = results.find((r) => r.error);
        if (failed?.error) throw failed.error;
      }

      if (assetType === "model3d" && modelFile) {
        model3dPath = `models/${crypto.randomUUID()}-${modelFile.name}`;
        const { error: modelErr } = await supabase.storage.from("vault-assets").upload(model3dPath, modelFile);
        if (modelErr) throw modelErr;
      }

      // 3. Insert the product row.
      const { error: insertErr } = await supabase.from("products").insert({
        name,
        category,
        collection,
        price_cents: Math.round(parseFloat(priceDollars || "0") * 100),
        description,
        metal: assetType === "parametric" ? metal : null,
        asset_type: assetType,
        hero_image_path: heroPath,
        turntable_folder_path: turntableFolderPath,
        model3d_path: model3dPath,
        is_published: isPublished,
      });
      if (insertErr) throw insertErr;

      setStatus("done");
      setStatusMessage(`"${name}" saved${isPublished ? " and published" : " as a draft"}.`);

      // reset form for the next piece
      setName("");
      setPriceDollars("");
      setDescription("");
      setHeroFile(null);
      setTurntableFiles(null);
      setModelFile(null);
      setIsPublished(false);
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(err.message ?? "Something went wrong saving this piece.");
    }
  }

  return (
    <div className="admin-shell">
      <form onSubmit={handleSubmit} className="admin-panel admin-panel--wide">
        <h1 className="admin-title">Add a Piece</h1>
        <p className="admin-sub">Fill in the details below. Fields shown depend on how this piece will be displayed.</p>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Name</label>
            <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="admin-field">
            <label className="admin-label">Price (USD)</label>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="0.01"
              value={priceDollars}
              onChange={(e) => setPriceDollars(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Category</label>
            <select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label">Collection</label>
            <select className="admin-input" value={collection} onChange={(e) => setCollection(e.target.value as Collection)}>
              <option value="atelier">Atelier (lab-grown)</option>
              <option value="terra">Terra (natural)</option>
            </select>
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Description</label>
          <textarea
            className="admin-input admin-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Display type</label>
          <select className="admin-input" value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)}>
            <option value="photo_only">Photo only (no spin yet)</option>
            <option value="turntable">Turntable photo set (drag-to-spin)</option>
            <option value="model3d">Real 3D model (.glb file)</option>
            <option value="parametric">Parametric (generated live, like the ring configurator)</option>
          </select>
        </div>

        {assetType === "parametric" && (
          <div className="admin-field">
            <label className="admin-label">Metal</label>
            <select className="admin-input" value={metal} onChange={(e) => setMetal(e.target.value)}>
              {METALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}

        <div className="admin-field">
          <label className="admin-label">Hero image (required — used as the listing thumbnail)</label>
          <input
            className="admin-input"
            type="file"
            accept="image/*"
            onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {assetType === "turntable" && (
          <div className="admin-field">
            <label className="admin-label">Turntable photo set (select all frames, in order)</label>
            <input
              className="admin-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setTurntableFiles(e.target.files)}
            />
          </div>
        )}

        {assetType === "model3d" && (
          <div className="admin-field">
            <label className="admin-label">3D model file (.glb)</label>
            <input
              className="admin-input"
              type="file"
              accept=".glb"
              onChange={(e) => setModelFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        <label className="admin-checkbox">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publish immediately (visible to customers)
        </label>

        {status === "error" && <p className="admin-error">{statusMessage}</p>}
        {status === "done" && <p className="admin-success">{statusMessage}</p>}

        <button type="submit" className="admin-cta" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save Piece"}
        </button>
      </form>

      <style jsx>{ADMIN_STYLES}</style>
    </div>
  );
}

const ADMIN_STYLES = `
  .admin-shell {
    min-height: 100vh;
    background: #0c0a08;
    color: #ede6d8;
    padding: 64px 24px;
    display: flex;
    justify-content: center;
  }
  .admin-shell--center {
    align-items: center;
  }
  .admin-panel {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .admin-panel--wide {
    max-width: 560px;
  }
  .admin-title {
    font-family: var(--font-serif), serif;
    font-style: italic;
    font-weight: 300;
    font-size: 28px;
    margin-bottom: 4px;
  }
  .admin-sub {
    font-size: 13px;
    color: #8a8378;
    margin-bottom: 24px;
  }
  .admin-row {
    display: flex;
    gap: 16px;
  }
  .admin-row .admin-field {
    flex: 1;
  }
  .admin-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 18px;
  }
  .admin-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #8a8378;
  }
  .admin-input {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.12);
    color: #ede6d8;
    font-family: var(--font-sans), sans-serif;
    font-size: 14px;
    padding: 10px 12px;
  }
  .admin-input:focus {
    outline: none;
    border-color: #c5a880;
  }
  .admin-textarea {
    resize: vertical;
  }
  .admin-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #b9b2a4;
    margin: 8px 0 24px;
  }
  .admin-cta {
    padding: 16px 0;
    background: transparent;
    border: 1px solid rgba(197,168,128,0.4);
    color: #ede6d8;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 300ms ease, color 300ms ease;
  }
  .admin-cta:hover:not(:disabled) {
    background: #c5a880;
    color: #0c0a08;
  }
  .admin-cta:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .admin-error {
    color: #d97757;
    font-size: 12px;
    margin-bottom: 12px;
  }
  .admin-success {
    color: #c5a880;
    font-size: 12px;
    margin-bottom: 12px;
  }
`;