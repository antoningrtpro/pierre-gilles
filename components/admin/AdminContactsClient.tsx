"use client";

import { useState } from "react";
import { ContactRequest } from "@/lib/db";

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "unread", label: "Non lus" },
  { key: "Achat", label: "Achat" },
  { key: "Collaboration", label: "Collaboration" },
  { key: "Autre", label: "Autre" },
];

interface AdminContactsClientProps {
  initialContacts: ContactRequest[];
}

export default function AdminContactsClient({
  initialContacts,
}: AdminContactsClientProps) {
  const [contacts, setContacts] = useState<ContactRequest[]>(initialContacts);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = contacts.filter((c) => {
    if (filter === "all") return true;
    if (filter === "unread") return !c.read;
    return c.subject === filter;
  });

  const markRead = async (id: string, read: boolean) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, read } : c))
    );
    if (selected?.id === id) {
      setSelected((prev) => (prev ? { ...prev, read } : prev));
    }
  };

  const deleteContact = async (id: string) => {
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
    setConfirmDelete(null);
  };

  const handleSelect = (contact: ContactRequest) => {
    setSelected(contact);
    if (!contact.read) markRead(contact.id, true);
  };

  const subjectColor = (subject: string) => {
    if (subject === "Achat")
      return "bg-moss/15 text-moss";
    if (subject === "Collaboration")
      return "bg-blue-50 text-blue-700";
    return "bg-ink/5 text-ink/60";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white border border-ink/8 rounded-lg overflow-hidden min-h-[500px]">
      {/* Left: list */}
      <div className="lg:col-span-2 border-r border-ink/8 flex flex-col">
        {/* Filters */}
        <div className="flex gap-1 p-3 border-b border-ink/8 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === f.key
                  ? "bg-ink text-cream"
                  : "bg-ink/5 text-ink/60 hover:bg-ink/10"
              }`}
            >
              {f.label}
              {f.key === "unread" && (
                <span className="ml-1.5 font-semibold">
                  ({contacts.filter((c) => !c.read).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-ink/40 text-sm">
              Aucun message.
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
                className={`w-full text-left px-4 py-3.5 border-b border-ink/6 hover:bg-ink/2 transition-colors flex items-start gap-3 ${
                  selected?.id === c.id ? "bg-moss/5" : ""
                }`}
              >
                {/* Unread dot */}
                <span
                  className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${
                    !c.read ? "bg-moss" : "bg-transparent"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className={`text-sm font-medium truncate ${
                        !c.read ? "text-ink" : "text-ink/60"
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className="text-xs text-ink/30 shrink-0">
                      {new Date(c.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${subjectColor(c.subject)}`}
                    >
                      {c.subject}
                    </span>
                    <span className="text-xs text-ink/40 truncate">
                      {c.message}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      <div className="lg:col-span-3 flex flex-col">
        {selected ? (
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  {selected.name}
                </h2>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-sm text-moss hover:underline"
                >
                  {selected.email}
                </a>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${subjectColor(selected.subject)}`}
                  >
                    {selected.subject}
                  </span>
                  {selected.photo_title && (
                    <span className="text-xs text-ink/50">
                      Photo : {selected.photo_title}
                    </span>
                  )}
                  {selected.format_selected && (
                    <span className="text-xs text-ink/40">
                      Format : {selected.format_selected}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-ink/40 whitespace-nowrap">
                {new Date(selected.created_at).toLocaleString("fr-FR")}
              </span>
            </div>

            {/* Message */}
            <div className="bg-ink/3 rounded p-5 mb-6">
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="px-4 py-2 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors"
              >
                Répondre par email
              </a>
              <button
                onClick={() => markRead(selected.id, !selected.read)}
                className="px-4 py-2 border border-ink/20 text-xs tracking-widest uppercase text-ink hover:bg-ink/5 transition-colors"
              >
                Marquer comme {selected.read ? "non lu" : "lu"}
              </button>
              {confirmDelete === selected.id ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteContact(selected.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-xs text-ink/40 hover:text-ink"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(selected.id)}
                  className="px-4 py-2 border border-red-200 text-red-500 text-xs tracking-widest uppercase hover:bg-red-50 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink/30 text-sm">
            Sélectionnez un message pour le lire.
          </div>
        )}
      </div>
    </div>
  );
}
