import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/cn";

/**
 * next/image wrapper. SVGs (sample placeholders) and blob: URLs (admin preview
 * of a just-picked file) skip the optimiser.
 */
export function NgoImage({ src, alt, className, ...props }: ImageProps & { src: string }) {
  const unoptimized = src.endsWith(".svg") || src.startsWith("blob:") || src.startsWith("data:");
  return <Image src={src} alt={alt} unoptimized={unoptimized} className={cn("object-cover", className)} {...props} />;
}

/** Square logo with a coloured-initial fallback. */
export function NgoLogo({
  name,
  src,
  size = 56,
  className,
}: {
  name: string;
  src: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <span style={style} className={cn("relative block shrink-0 overflow-hidden rounded-2xl bg-white", className)}>
        <NgoImage src={src} alt={`${name} logo`} fill sizes={`${size}px`} />
      </span>
    );
  }
  const initial = name.replace(/^sample\s+/i, "").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      style={{ ...style, fontSize: size * 0.42 }}
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-2xl bg-peach font-display font-extrabold text-ink", className)}
    >
      {initial}
    </span>
  );
}
