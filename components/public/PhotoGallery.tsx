"use client";

import { useState } from "react";
import { imageUrl, formatPrice } from "@/lib/utils";

interface PhotoGalleryProps {
  images: string[];
  title: string;
  minPrice: number | null;
}

export default function PhotoGallery({ images, title, minPrice }: PhotoGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Main image */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 md:p-6 lg:p-10 overflow-hidden">
        <div className="
          bg-white
          shadow-[0_8px_48px_rgba(26,26,24,0.12)]
          flex flex-col
          max-w-full max-h-full
          min-w-0
        ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl(images[selected])}
            alt={title}
            className="block p-3 md:p-5 max-w-full max-h-full object-contain"
            style={{
              maxHeight: images.length > 1
                ? "calc(100dvh - 5rem - 41px - 9rem)"
                : "calc(100dvh - 5rem - 41px - 4rem)",
            }}
          />
          <div className="px-3 md:px-5 pb-3 md:pb-4 flex items-center justify-between gap-4 shrink-0">
            <p className="text-[10px] tracking-widest uppercase text-ink/30">
              Papier de qualité — 20 exemplaires
            </p>
            {minPrice && (
              <p className="text-[10px] tracking-widest uppercase text-ink/30 whitespace-nowrap">
                À partir de {formatPrice(minPrice)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="shrink-0 flex gap-2 px-4 md:px-6 lg:px-10 pb-4 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`shrink-0 w-14 h-14 border-2 transition-colors overflow-hidden rounded-sm ${
                selected === i ? "border-moss" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(img)}
                alt={`Vue ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
