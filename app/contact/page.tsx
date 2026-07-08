// app/contact/page.tsx
export default function Contact() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-24 max-w-xl mx-auto">
      <h1 className="text-4xl font-serif text-[#C5A880] text-center mb-4 tracking-widest">
        Commission
      </h1>
      <p className="text-center text-[#666] mb-12 text-sm">
        Direct inquiries to the atelier.
      </p>

      <form
        action="https://formspree.io/f/YOUR_FORM_ID"
        method="POST"
        className="space-y-6"
      >
        <div>
          <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">Message</label>
          <textarea
            name="message"
            rows={5}
            required
            className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[#C5A880] text-[#0a0a0a] hover:bg-[#b89a70] transition-colors tracking-widest text-sm uppercase"
        >
          Send Inquiry
        </button>
      </form>

      <p className="text-center text-[#444] text-xs mt-8">
        Or email directly:{" "}
        <a href="mailto:goblinsharkyellow@gmail.com" className="text-[#666] hover:text-[#C5A880]">
          goblinsharkyellow@gmail.com
        </a>
      </p>
    </main>
  );
}