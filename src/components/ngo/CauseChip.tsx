import { getCause } from "@/config/causes";
import { Chip, ChipLink } from "@/components/ui/Chip";

export function CauseChip({ slug, link = false }: { slug: string; link?: boolean }) {
  const cause = getCause(slug);
  const content = (
    <>
      <span aria-hidden>{cause?.emoji}</span>
      {cause?.label ?? slug}
    </>
  );
  return link ? <ChipLink href={`/causes/${slug}`}>{content}</ChipLink> : <Chip>{content}</Chip>;
}
