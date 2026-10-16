// Pune areas. `slug` is stored in the database and used in URLs (/areas/kothrud).
// lat/lng are APPROXIMATE area centres, used for "near me" when an NGO
// has no exact coordinates. Adjust freely.

export type Area = { slug: string; name: string; lat: number; lng: number };

/** Rough centre of Pune city — used for "Other". */
export const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

export const areas: Area[] = [
  { slug: "akurdi", name: "Akurdi", lat: 18.6483, lng: 73.7689 },
  { slug: "aundh", name: "Aundh", lat: 18.559, lng: 73.8078 },
  { slug: "baner", name: "Baner", lat: 18.559, lng: 73.7868 },
  { slug: "bavdhan", name: "Bavdhan", lat: 18.5135, lng: 73.77 },
  { slug: "bhosari", name: "Bhosari", lat: 18.629, lng: 73.847 },
  { slug: "camp", name: "Camp", lat: 18.516, lng: 73.879 },
  { slug: "chinchwad", name: "Chinchwad", lat: 18.644, lng: 73.792 },
  { slug: "deccan", name: "Deccan", lat: 18.5167, lng: 73.8411 },
  { slug: "hadapsar", name: "Hadapsar", lat: 18.5089, lng: 73.926 },
  { slug: "hinjewadi", name: "Hinjewadi", lat: 18.5912, lng: 73.7389 },
  { slug: "kalyani-nagar", name: "Kalyani Nagar", lat: 18.5463, lng: 73.9033 },
  { slug: "katraj", name: "Katraj", lat: 18.4575, lng: 73.8677 },
  { slug: "kharadi", name: "Kharadi", lat: 18.5515, lng: 73.9348 },
  { slug: "kondhwa", name: "Kondhwa", lat: 18.473, lng: 73.897 },
  { slug: "kothrud", name: "Kothrud", lat: 18.5074, lng: 73.8077 },
  { slug: "magarpatta", name: "Magarpatta", lat: 18.5146, lng: 73.927 },
  { slug: "nigdi", name: "Nigdi", lat: 18.651, lng: 73.77 },
  { slug: "pimple-saudagar", name: "Pimple Saudagar", lat: 18.599, lng: 73.799 },
  { slug: "pimpri", name: "Pimpri", lat: 18.6298, lng: 73.8131 },
  { slug: "ravet", name: "Ravet", lat: 18.648, lng: 73.743 },
  { slug: "shivajinagar", name: "Shivajinagar", lat: 18.5308, lng: 73.8475 },
  { slug: "swargate", name: "Swargate", lat: 18.5018, lng: 73.8636 },
  { slug: "viman-nagar", name: "Viman Nagar", lat: 18.5679, lng: 73.9143 },
  { slug: "wagholi", name: "Wagholi", lat: 18.5793, lng: 73.9787 },
  { slug: "wakad", name: "Wakad", lat: 18.599, lng: 73.762 },
  { slug: "warje", name: "Warje", lat: 18.484, lng: 73.801 },
  { slug: "yerawada", name: "Yerawada", lat: 18.553, lng: 73.886 },
  { slug: "other", name: "Other", lat: PUNE_CENTER.lat, lng: PUNE_CENTER.lng },
];

const bySlug = new Map(areas.map((a) => [a.slug, a]));

export function getArea(slug: string): Area | undefined {
  return bySlug.get(slug);
}

export function areaName(slug: string): string {
  return getArea(slug)?.name ?? slug;
}
