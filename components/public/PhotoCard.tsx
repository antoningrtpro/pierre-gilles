import Image from "next/image";
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
  variant = "landscape",
}: PhotoCardProps) {
  const aspectClass =
    variant === "portrait" ? "aspect-portrait" : "aspect-landscape";

  return (
    <RevealOnScroll delay={index * 80}>
      <Link href={`/photo/${photo.slug}`} className="group block">
        <div
          className={`relative overflow-hidden bg-ink/5 ${aspectClass} rounded-sm`}
        >
          <Image
            src={imageUrl(photo.filename)}
            alt={photo.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
