import Link from "next/link";
import { imageUrl, formatPrice } from "@/lib/utils";
import { Photo } from "@/lib/db";
import RevealOnScroll from "./RevealOnScroll";

interface PhotoCardProps {
  photo: Photo;
  index?: number;
  variant?: "landscape" | "portrait";
}

export default function PhotoCard({
  photo,
  index = 0,
}: PhotoCardProps) {
  return (
    <RevealOnScroll delay={index * 80}>
      <Link href={`/photo/${photo.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EDE8] rounded-sm flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl(photo.filename)}
            alt={photo.title}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-sans text-sm font-medium text-ink leading-snug group-hover:text-moss transition-colors">
              {photo.title}
            </h3>
            {photo.category_name && (
              <p className="text-xs text-ink/50 mt-0.5 tracking-wide">
                {photo.category_name}
              </p>
            )}
          </div>
          {photo.min_price !== undefined && (
            <p className="text-xs text-ink/60 whitespace-nowrap pt-px">
              À partir de{" "}
              <span className="text-moss font-medium">
                {formatPrice(photo.min_price)}
              </span>
            </p>
          )}
        </div>
      </Link>
    </RevealOnScroll>
  );
}
