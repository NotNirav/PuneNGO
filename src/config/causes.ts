// Causes an NGO can be tagged with. `slug` is what's stored in the database
// and used in URLs (/causes/education) — don't change a slug once NGOs use it.

export type CauseSlug =
  | "education"
  | "child-welfare"
  | "women-empowerment"
  | "health-medical"
  | "mental-health"
  | "animal-welfare"
  | "environment"
  | "elderly-care"
  | "disability-support"
  | "hunger-food"
  | "disaster-relief"
  | "skill-development"
  | "rural-development"
  | "arts-culture"
  | "other";

export type Cause = {
  slug: CauseSlug;
  label: string;
  emoji: string;
  intro: string;
};

export const causes: Cause[] = [
  { slug: "education", label: "Education", emoji: "📚", intro: "NGOs in Pune teaching children and adults, running study centres and supporting schools." },
  { slug: "child-welfare", label: "Child Welfare", emoji: "🧸", intro: "Groups caring for children's safety, nutrition, shelter and rights across Pune." },
  { slug: "women-empowerment", label: "Women Empowerment", emoji: "💪", intro: "Organisations helping women with livelihoods, safety, legal aid and leadership." },
  { slug: "health-medical", label: "Health & Medical", emoji: "🩺", intro: "Health camps, patient support, blood donation and medical aid in Pune." },
  { slug: "mental-health", label: "Mental Health", emoji: "🧠", intro: "Counselling, helplines and awareness for mental well-being." },
  { slug: "animal-welfare", label: "Animal Welfare", emoji: "🐾", intro: "Rescue, shelters, feeding and medical care for animals in Pune." },
  { slug: "environment", label: "Environment", emoji: "🌱", intro: "Tree plantation, river clean-ups, waste management and climate action." },
  { slug: "elderly-care", label: "Elderly Care", emoji: "🧓", intro: "Old-age homes, day care and companionship for senior citizens." },
  { slug: "disability-support", label: "Disability Support", emoji: "♿", intro: "Therapy, education and inclusion for people with disabilities." },
  { slug: "hunger-food", label: "Hunger & Food", emoji: "🍲", intro: "Food banks, community kitchens and meal distribution in Pune." },
  { slug: "disaster-relief", label: "Disaster Relief", emoji: "🆘", intro: "Emergency response and rebuilding after floods and other disasters." },
  { slug: "skill-development", label: "Skill Development", emoji: "🛠️", intro: "Vocational training, digital literacy and job readiness programmes." },
  { slug: "rural-development", label: "Rural Development", emoji: "🌾", intro: "Work in villages around Pune — water, farming, sanitation and more." },
  { slug: "arts-culture", label: "Arts & Culture", emoji: "🎨", intro: "Keeping art, music, theatre and heritage alive in the community." },
  { slug: "other", label: "Other", emoji: "✨", intro: "NGOs doing other important work in Pune." },
];

const bySlug = new Map(causes.map((c) => [c.slug, c]));

export function getCause(slug: string): Cause | undefined {
  return bySlug.get(slug as CauseSlug);
}

export function causeLabel(slug: string): string {
  return getCause(slug)?.label ?? slug;
}
