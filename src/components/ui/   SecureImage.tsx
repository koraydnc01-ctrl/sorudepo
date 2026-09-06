"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function extractStoragePath(stored: string) {
  const marker = "/question-images/";
  const idx = stored.indexOf(marker);
  if (idx === -1) return stored; // zaten yalın bir path ise olduğu gibi kullan
  return stored.slice(idx + marker.length);
}

interface SecureImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export function SecureImage({ imageUrl, alt, className, onClick }: SecureImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const path = extractStoragePath(imageUrl);
      const { data } = await supabase.storage
        .from("question-images")
        .createSignedUrl(path, 3600);
      if (active) setSrc(data?.signedUrl ?? null);
    }
    load();
    return () => {
      active = false;
    };
  }, [imageUrl]);

  if (!src) {
    return <div className={cn(className, "bg-line animate-pulse")} onClick={onClick} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onClick={onClick} />
  );
}