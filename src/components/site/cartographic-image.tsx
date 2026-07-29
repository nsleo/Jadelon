"use client";

import Image from "next/image";
import { useState } from "react";

type CartographicImageProps = {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
  src: string;
};

export function CartographicImage({
  alt,
  className,
  priority = false,
  sizes,
  src,
}: CartographicImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label={alt}
        className={className ? `cartographic-fallback ${className}` : "cartographic-fallback"}
        role="img"
      >
        <span>Mapa indisponivel</span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill
      loading={priority ? "eager" : undefined}
      onError={() => setFailed(true)}
      priority={priority}
      sizes={sizes}
      src={src}
      unoptimized
    />
  );
}
