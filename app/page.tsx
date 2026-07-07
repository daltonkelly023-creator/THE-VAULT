import { getPublishedPieces } from "@/lib/products";
import CollectionGrid from "@/components/CollectionGrid";
import EditorialHeader from "@/components/EditorialHeader";

// Re-fetch on every request rather than caching, since pieces get
// added/published from the admin panel and should show up immediately.
export const dynamic = "force-dynamic";

export default async function ShowroomGallery() {
  const pieces = await getPublishedPieces();

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-16 md:py-24">
      <section className="max-w-7xl mx-auto mb-16 md:mb-24 text-center md:text-left space-y-4">
        <EditorialHeader eyebrow="Curated Exhibition" title="The Permanent Collection" />
      </section>

      {pieces.length > 0 ? (
        <CollectionGrid pieces={pieces} />
      ) : (
        <p className="max-w-7xl mx-auto text-center text-sm text-zinc-500 font-sans py-24">
          The collection is being prepared. Please check back shortly.
        </p>
      )}
    </main>
  );
}
