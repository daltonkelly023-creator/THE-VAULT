"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Particles from "@/components/Particles";
import { supabase } from "@/lib/supabaseClient";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const pieceTypes = [
  { key: "ring", label: "Ring" },
  { key: "necklace", label: "Necklace" },
  { key: "bracelet", label: "Bracelet" },
  { key: "earring", label: "Earrings" },
  { key: "watch", label: "Timepiece" },
  { key: "other", label: "Other" },
];

const budgetRanges = [
  "Under $2,000",
  "$2,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
  "Not sure yet",
];

const MAX_FILES = 5;
const MAX_FILE_MB = 8;

interface RefImage {
  file: File;
  previewUrl: string;
}

export default function CommissionPage() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [images, setImages] = useState<RefImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setFormError("");

    const incoming = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const tooBig = incoming.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) {
      setFormError(`"${tooBig.name}" is over ${MAX_FILE_MB}MB — please use a smaller image.`);
      return;
    }

    setImages((prev) => {
      const room = MAX_FILES - prev.length;
      if (room <= 0) {
        setFormError(`You can attach up to ${MAX_FILES} reference photos.`);
        return prev;
      }
      const next = incoming.slice(0, room).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadReferenceImages(): Promise<string[]> {
    if (images.length === 0) return [];
    const urls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      setUploadProgress(`Uploading photo ${i + 1} of ${images.length}...`);
      const { file } = images[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `commission-refs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("vault-assets")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        throw new Error(`Couldn't upload "${file.name}": ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage.from("vault-assets").getPublicUrl(path);
      urls.push(publicUrlData.publicUrl);
    }

    setUploadProgress("");
    return urls;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setFormError("");
    setEmailError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const name = (formData.get("name") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    const pieceType = (formData.get("pieceType") as string) || "";
    const budget = (formData.get("budget") as string) || "";

    if (!email) { setEmailError("Email is required"); setFormState("error"); return; }
    if (!isValidEmail(email)) { setEmailError("Please enter a valid email address"); setFormState("error"); return; }
    if (!name) { setFormError("Name is required"); setFormState("error"); return; }

    try {
      const referenceImages = await uploadReferenceImages();

      const data = {
        name,
        email,
        phone: phone || null,
        message: formData.get("message"),
        pieceName: pieceType ? pieceTypes.find((p) => p.key === pieceType)?.label : "General Inquiry",
        collection: "N/A",
        budget: budget || null,
        referenceImages,
      };

      const res = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send");
      setFormState("success");
    } catch (err: any) {
      setUploadProgress("");
      setFormState("error");
      setFormError(err.message || "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] relative overflow-hidden">
      <Particles />

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]/50 backdrop-blur-sm bg-[#0a0a0a]/80">
        <Link href="/" className="text-[#c9a96e] text-sm tracking-[0.4em] font-light uppercase">Atelier</Link>
        <nav className="flex gap-8 text-xs tracking-[0.2em] text-gray-500">
          <Link href="/collection" className="hover:text-[#c9a96e]">Showroom</Link>
          <Link href="/commission" className="text-[#c9a96e]">Commission</Link>
        </nav>
      </header>

      <div className="relative z-[3] min-h-screen flex flex-col items-center justify-center px-4 pt-24">
        <h1 className="text-4xl md:text-5xl font-serif text-[#c9a96e] text-center mb-4 tracking-widest">Commission</h1>
        <p className="text-center text-gray-600 mb-12 text-sm tracking-wide">Direct inquiries to the atelier. Saved to Supabase + instant email via Resend.</p>

        <div className="w-full max-w-md">
          {formState === "success" ? (
            <div className="border border-[#c9a96e] p-8 text-center bg-[#0a0a0a]/80">
              <p className="text-[#c9a96e] font-serif text-xl mb-2">Request Received</p>
              <p className="text-gray-500 text-sm">A master jeweler will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Name <span className="text-[#c9a96e]">*</span></label>
                  <input name="name" type="text" required className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-[#e5e5e5] focus:border-[#c9a96e] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Phone</label>
                  <input name="phone" type="tel" placeholder="Optional" className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-[#e5e5e5] placeholder-gray-700 focus:border-[#c9a96e] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Email <span className="text-[#c9a96e]">*</span></label>
                <input name="email" type="email" required className={`w-full bg-[#111] border px-4 py-3 focus:outline-none ${emailError ? 'border-red-800' : 'border-[#1a1a1a] focus:border-[#c9a96e]'}`} />
                {emailError && <p className="text-red-400 text-xs mt-2">{emailError}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Piece Type</label>
                  <select name="pieceType" defaultValue="" className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-[#e5e5e5] focus:border-[#c9a96e] outline-none appearance-none">
                    <option value="">Select a category</option>
                    {pieceTypes.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Budget</label>
                  <select name="budget" defaultValue="" className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-[#e5e5e5] focus:border-[#c9a96e] outline-none appearance-none">
                    <option value="">Prefer not to say</option>
                    {budgetRanges.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">Message</label>
                <textarea name="message" rows={5} placeholder="Tell us about the piece you have in mind — stone, metal, sizing, occasion, anything that helps." className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-[#e5e5e5] placeholder-gray-700 focus:border-[#c9a96e] outline-none resize-none" />
              </div>

              {/* Reference photos */}
              <div>
                <label className="block text-xs text-gray-600 tracking-widest uppercase mb-2">
                  Reference Photos <span className="normal-case text-gray-700">(optional, up to {MAX_FILES})</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />

                {images.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-[#1a1a1a] hover:border-[#c9a96e]/50 transition-colors py-8 flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-gray-400"
                  >
                    <span className="text-2xl leading-none text-[#c9a96e]">+</span>
                    <span className="text-[10px] tracking-widest uppercase">
                      Upload a photo of the piece you have in mind
                    </span>
                    <span className="text-[10px] text-gray-700">Inspiration, sketches, or an heirloom to reference</span>
                  </button>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square border border-[#1a1a1a] overflow-hidden group">
                        <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-[#0a0a0a]/90 border border-[#1a1a1a] text-gray-400 hover:text-[#c9a96e] hover:border-[#c9a96e]/50 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {uploadProgress && (
                <p className="text-[#c9a96e] text-xs tracking-wider">{uploadProgress}</p>
              )}
              {formError && !emailError && <p className="text-red-400 text-xs">{formError}</p>}

              <button type="submit" disabled={formState === "submitting"} className="w-full py-4 bg-[#c9a96e] text-[#0a0a0a] hover:bg-[#b8985d] tracking-[0.2em] text-sm uppercase font-medium disabled:opacity-50">
                {formState === "submitting" ? (uploadProgress || "Sending...") : "Send Inquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}