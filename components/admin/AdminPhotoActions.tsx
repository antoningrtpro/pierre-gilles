"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPhotoActions({ photoId }: { photoId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/admin/photos/${photoId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-ink/60">Confirmer ?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-600 hover:underline disabled:opacity-50"
        >
          {deleting ? "…" : "Supprimer"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-ink/40 hover:text-ink"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      <Link
        href={`/admin/photos/${photoId}/edit`}
        className="text-xs text-moss hover:underline"
      >
        Modifier
      </Link>
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-ink/40 hover:text-red-500 transition-colors"
      >
        Supprimer
      </button>
    </div>
  );
}
