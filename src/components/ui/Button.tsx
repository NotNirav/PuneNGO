import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "lime";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-cobalt text-white hover:bg-cobalt-deep",
  secondary: "bg-ice text-cobalt-deep hover:bg-[#d3e2ff]",
  outline: "border border-line bg-white text-ink hover:border-cobalt hover:text-cobalt",
  ghost: "text-ink hover:bg-ice",
  lime: "bg-lime text-ink hover:bg-[#dcf75f]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

type StyleProps = { variant?: Variant; size?: Size };

export function buttonClasses({ variant = "primary", size = "md" }: StyleProps = {}, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={buttonClasses({ variant, size }, className)} {...props} />;
}

/** Internal links use next/link; external ones (tel:, mailto:, https:) use a plain <a>. */
export function ButtonLink({
  variant,
  size,
  className,
  href,
  external,
  ...props
}: Omit<ComponentProps<"a">, "href"> & StyleProps & { href: string; external?: boolean }) {
  const classes = buttonClasses({ variant, size }, className);
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    );
  }
  return <Link href={href} className={classes} {...props} />;
}
