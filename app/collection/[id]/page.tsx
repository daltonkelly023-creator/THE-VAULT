import { notFound } from "next/navigation";
import { getPublishedPieceById } from "@/lib/products";
import PrivateViewingRoom from "@/components/PrivateViewingRoom";

export const dynamic = "force-dynamic";

export default async function PrivateViewingRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const piece = await getPublishedPieceById(id);

  if (!piece) {
    notFound();
  }

  return <PrivateViewingRoom piece={piece} />;
}
