"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminCategoryActions({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
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
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-ink/30 hover:text-red-500 transition-colors shrink-0"
    >
      Supprimer
    </button>
  );
}
