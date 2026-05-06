export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function imageUrl(filename: string): string {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `/api/file/${filename}`;
}

/**
 * Convertit un document Firestore en objet plain JSON sérialisable.
 * Transforme les Timestamp en string ISO, supprime les valeurs undefined.
 */
export function serializeDoc<T extends Record<string, any>>(data: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      result[key] = null;
    } else if (value && typeof value.toDate === "function") {
      // Firestore Timestamp → string ISO
      result[key] = value.toDate().toISOString();
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === "object" && typeof item.toDate === "function"
          ? item.toDate().toISOString()
          : item && typeof item === "object" && !(item instanceof Date)
          ? serializeDoc(item)
          : item
      );
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
