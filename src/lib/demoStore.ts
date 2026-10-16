import type { NgoPrivateRow, NgoRow } from "./database.types";
import type { PublicNgo } from "./types";
import type { AdminNgoListItem } from "./admin/data";
import { slugify } from "./ngoForm";
import { randomUUID } from "node:crypto";

const initialNgos: NgoRow[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "sample-learning-foundation",
    name: "Sample Learning Foundation",
    tagline: "Free evening classes for school kids in Kothrud.",
    description:
      "This is a sample listing used to demo NGOConnect.\n\nThe Sample Learning Foundation runs free evening study classes for children from nearby bastis. Volunteers help with homework, reading and basic maths in Marathi and English.",
    activities: [
      "Evening study classes (Class 1–8)",
      "Weekend reading club",
      "School supply drives every June",
    ],
    causes: ["education", "child-welfare"],
    help_types: ["volunteer", "donate-items", "donate-money"],
    help_notes: "Looking for weekend volunteers to teach English and maths (2 hours a week).",
    area: "kothrud",
    address: "Sample Lane, Kothrud, Pune, Maharashtra 411038",
    maps_url: "https://maps.google.com/?q=Kothrud,Pune",
    lat: 18.5074,
    lng: 73.8077,
    phone: "+91 00000 00000",
    whatsapp: "+910000000000",
    email: "hello@example.org",
    website: "https://example.org",
    instagram: "https://instagram.com/example",
    facebook: "https://facebook.com/example",
    linkedin: null,
    youtube: null,
    donation_link: "https://example.org/donate",
    founded_year: 2015,
    registration_type: "Trust",
    registration_number: "SAMPLE-0001",
    visiting_hours: "Mon–Sat, 5 pm – 8 pm",
    languages: ["Marathi", "Hindi", "English"],
    logo_url: "/samples/learning-logo.svg",
    cover_url: "/samples/learning-cover.svg",
    gallery_urls: [
      "/samples/learning-cover.svg",
      "/samples/udaan-cover.svg",
      "/samples/green-cover.svg",
    ],
    is_featured: true,
    status: "published",
    is_sample: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "sample-paws-rescue-trust",
    name: "Sample Paws Rescue Trust",
    tagline: "Rescue, treatment and adoption for street animals.",
    description:
      "This is a sample listing used to demo NGOConnect.\n\nSample Paws Rescue Trust picks up injured street dogs and cats, treats them at a small shelter and finds them loving homes.",
    activities: [
      "24×7 rescue for injured animals",
      "Vaccination and sterilisation drives",
      "Weekend adoption camps",
    ],
    causes: ["animal-welfare"],
    help_types: ["volunteer", "donate-money", "donate-items", "events-drives"],
    help_notes: "We always need old blankets, newspapers and dog food.",
    area: "baner",
    address: "Sample Road, Baner, Pune, Maharashtra 411045",
    maps_url: "https://maps.google.com/?q=Baner,Pune",
    lat: 18.559,
    lng: 73.7868,
    phone: "+91 00000 00000",
    whatsapp: "+910000000000",
    email: "hello@example.org",
    website: "https://example.org",
    instagram: "https://instagram.com/example",
    facebook: null,
    linkedin: null,
    youtube: "https://youtube.com/@example",
    donation_link: null,
    founded_year: 2018,
    registration_type: "Society",
    registration_number: "SAMPLE-0002",
    visiting_hours: "Daily, 10 am – 6 pm",
    languages: ["Marathi", "English"],
    logo_url: "/samples/paws-logo.svg",
    cover_url: "/samples/paws-cover.svg",
    gallery_urls: ["/samples/paws-cover.svg", "/samples/food-cover.svg"],
    is_featured: true,
    status: "published",
    is_sample: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "sample-green-pune-collective",
    name: "Sample Green Pune Collective",
    tagline: "Tree plantation and river clean-ups across Pune.",
    description:
      "This is a sample listing used to demo NGOConnect.\n\nA volunteer group that plants native trees on hills around the city and organises monthly clean-ups along the Mula–Mutha riverbanks.",
    activities: [
      "Monthly riverbank clean-ups",
      "Native tree plantation drives in monsoon",
      "Composting workshops for housing societies",
    ],
    causes: ["environment"],
    help_types: ["volunteer", "events-drives", "pro-bono"],
    help_notes: null,
    area: "aundh",
    address: null,
    maps_url: "https://maps.google.com/?q=Aundh,Pune",
    lat: 18.559,
    lng: 73.8078,
    phone: null,
    whatsapp: "+910000000000",
    email: "hello@example.org",
    website: null,
    instagram: "https://instagram.com/example",
    facebook: null,
    linkedin: "https://linkedin.com/company/example",
    youtube: null,
    donation_link: null,
    founded_year: 2020,
    registration_type: null,
    registration_number: null,
    visiting_hours: null,
    languages: ["Marathi", "English"],
    logo_url: "/samples/green-logo.svg",
    cover_url: "/samples/green-cover.svg",
    gallery_urls: [],
    is_featured: false,
    status: "published",
    is_sample: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    slug: "sample-annapurna-food-bank",
    name: "Sample Annapurna Food Bank",
    tagline: "Collecting surplus food and sharing it with families in need.",
    description:
      "This is a sample listing used to demo NGOConnect.\n\nSample Annapurna Food Bank collects extra food from weddings, hostels and restaurants and delivers it to shelters and families in Hadapsar and nearby areas.",
    activities: [
      "Daily surplus-food pickup",
      "Monthly ration kits for families",
      "Community kitchen on Sundays",
    ],
    causes: ["hunger-food"],
    help_types: ["donate-money", "donate-items", "volunteer"],
    help_notes: "Volunteers with a two-wheeler are welcome for evening pickups.",
    area: "hadapsar",
    address: "Sample Chowk, Hadapsar, Pune, Maharashtra 411028",
    maps_url: "https://maps.google.com/?q=Hadapsar,Pune",
    lat: 18.5089,
    lng: 73.926,
    phone: "+91 00000 00000",
    whatsapp: "+910000000000",
    email: "hello@example.org",
    website: "https://example.org",
    instagram: null,
    facebook: "https://facebook.com/example",
    linkedin: null,
    youtube: null,
    donation_link: "https://example.org/donate",
    founded_year: 2017,
    registration_type: "Section 8 Company",
    registration_number: "SAMPLE-0004",
    visiting_hours: "Mon–Sun, 9 am – 9 pm",
    languages: ["Marathi", "Hindi"],
    logo_url: "/samples/food-logo.svg",
    cover_url: "/samples/food-cover.svg",
    gallery_urls: ["/samples/food-cover.svg", "/samples/seniors-cover.svg"],
    is_featured: true,
    status: "published",
    is_sample: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    slug: "sample-saathi-senior-care",
    name: "Sample Saathi Senior Care",
    tagline: "Day care, health check-ups and company for senior citizens.",
    description:
      "This is a sample listing used to demo NGOConnect.\n\nSample Saathi runs a day-care centre where senior citizens can spend the day together, with simple health check-ups, yoga and games.",
    activities: [
      "Day-care centre for seniors",
      "Free BP and sugar check-ups every Saturday",
      "Phone check-ins for seniors living alone",
    ],
    causes: ["elderly-care", "health-medical"],
    help_types: ["volunteer", "donate-money", "pro-bono"],
    help_notes: "Doctors and nurses who can give 2 hours a month are especially welcome.",
    area: "nigdi",
    address: null,
    maps_url: "https://maps.google.com/?q=Nigdi,Pune",
    lat: 18.6534,
    lng: 73.7749,
    phone: "+91 00000 00000",
    whatsapp: null,
    email: "hello@example.org",
    website: null,
    instagram: null,
    facebook: null,
    linkedin: null,
    youtube: null,
    donation_link: null,
    founded_year: 2012,
    registration_type: "Trust",
    registration_number: "SAMPLE-0005",
    visiting_hours: "Mon–Fri, 9 am – 5 pm",
    languages: ["Marathi", "Hindi"],
    logo_url: "/samples/seniors-logo.svg",
    cover_url: "/samples/seniors-cover.svg",
    gallery_urls: [],
    is_featured: false,
    status: "published",
    is_sample: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    slug: "sample-udaan-womens-skills-centre",
    name: "Sample Udaan Women's Skills Centre",
    tagline: "Tailoring, computer and money-management classes for women.",
    description:
      "This is a sample listing used to demo NGOConnect.\n\nSample Udaan helps women earn an income through short skills courses, and connects them with local shops and small businesses.",
    activities: [
      "3-month tailoring course",
      "Basic computer and smartphone classes",
      "Savings group meetings",
    ],
    causes: ["women-empowerment", "skill-development"],
    help_types: ["internships", "volunteer", "donate-items"],
    help_notes: "Old sewing machines in working condition are very useful.",
    area: "yerawada",
    address: "Sample Nagar, Yerawada, Pune, Maharashtra 411006",
    maps_url: "https://maps.google.com/?q=Yerawada,Pune",
    lat: 18.553,
    lng: 73.886,
    phone: "+91 00000 00000",
    whatsapp: "+910000000000",
    email: null,
    website: "https://example.org",
    instagram: "https://instagram.com/example",
    facebook: null,
    linkedin: null,
    youtube: null,
    donation_link: null,
    founded_year: 2019,
    registration_type: "Society",
    registration_number: "SAMPLE-0006",
    visiting_hours: "Tue–Sat, 11 am – 4 pm",
    languages: ["Marathi", "Hindi", "Urdu"],
    logo_url: "/samples/udaan-logo.svg",
    cover_url: "/samples/udaan-cover.svg",
    gallery_urls: [],
    is_featured: false,
    status: "published",
    is_sample: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    slug: "sample-mind-matters-draft",
    name: "Sample Mind Matters (Draft)",
    tagline: "Draft entry — should not be visible publicly.",
    description:
      "This is a sample DRAFT listing used to verify admin draft states and previewing capabilities.",
    activities: [],
    causes: ["mental-health"],
    help_types: ["volunteer"],
    help_notes: null,
    area: "viman-nagar",
    address: null,
    maps_url: null,
    lat: null,
    lng: null,
    phone: null,
    whatsapp: null,
    email: null,
    website: null,
    instagram: null,
    facebook: null,
    linkedin: null,
    youtube: null,
    donation_link: null,
    founded_year: null,
    registration_type: null,
    registration_number: null,
    visiting_hours: null,
    languages: [],
    logo_url: "/samples/mind-logo.svg",
    cover_url: "/samples/mind-cover.svg",
    gallery_urls: [],
    is_featured: false,
    status: "draft",
    is_sample: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    published_at: null,
  },
];

const initialPrivates: NgoPrivateRow[] = [
  {
    ngo_id: "00000000-0000-0000-0000-000000000001",
    contact_person: "Pooja Deshmukh",
    contact_person_phone: "+91 98765 43210",
    internal_notes: "Verified demo entry for PCCOE Design Thinking prototype.",
    data_received_on: "2026-01-01",
  },
  {
    ngo_id: "00000000-0000-0000-0000-000000000002",
    contact_person: "Rohan Kulkarni",
    contact_person_phone: "+91 98220 12345",
    internal_notes: "Verified animal rescue demo contact.",
    data_received_on: "2026-01-01",
  },
  {
    ngo_id: "00000000-0000-0000-0000-000000000003",
    contact_person: "Ananya Joshi",
    contact_person_phone: "+91 98900 55443",
    internal_notes: "Volunteer team coordinator.",
    data_received_on: "2026-01-01",
  },
  {
    ngo_id: "00000000-0000-0000-0000-000000000004",
    contact_person: "Suresh Shinde",
    contact_person_phone: "+91 97654 32109",
    internal_notes: "Food drive coordinator.",
    data_received_on: "2026-01-01",
  },
  {
    ngo_id: "00000000-0000-0000-0000-000000000005",
    contact_person: "Dr. Smita Patil",
    contact_person_phone: "+91 94220 98765",
    internal_notes: "Geriatric care lead.",
    data_received_on: "2026-01-01",
  },
  {
    ngo_id: "00000000-0000-0000-0000-000000000006",
    contact_person: "Sunita Kamble",
    contact_person_phone: "+91 95521 11223",
    internal_notes: "Women vocational trainer.",
    data_received_on: "2026-01-01",
  },
  {
    ngo_id: "00000000-0000-0000-0000-000000000007",
    contact_person: "Rahul Gokhale",
    contact_person_phone: "+91 99230 44556",
    internal_notes: "Draft review pending.",
    data_received_on: "2026-01-01",
  },
];

type Store = {
  ngos: Map<string, NgoRow>;
  privates: Map<string, NgoPrivateRow>;
};

declare global {
  var __NGC_DEMO_STORE__: Store | undefined;
}

function getStore(): Store {
  if (!globalThis.__NGC_DEMO_STORE__) {
    const ngos = new Map<string, NgoRow>();
    const privates = new Map<string, NgoPrivateRow>();
    for (const n of initialNgos) ngos.set(n.id, { ...n });
    for (const p of initialPrivates) privates.set(p.ngo_id, { ...p });
    globalThis.__NGC_DEMO_STORE__ = { ngos, privates };
  }
  return globalThis.__NGC_DEMO_STORE__;
}

export function getMockAllNgos(): AdminNgoListItem[] {
  const store = getStore();
  const list: AdminNgoListItem[] = [];
  for (const n of store.ngos.values()) {
    list.push({
      id: n.id,
      slug: n.slug,
      name: n.name,
      area: n.area,
      causes: n.causes,
      status: n.status,
      is_featured: n.is_featured,
      is_sample: n.is_sample,
      logo_url: n.logo_url,
      updated_at: n.updated_at,
    });
  }
  return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function getMockPublishedNgos(): PublicNgo[] {
  const store = getStore();
  const published: PublicNgo[] = [];
  for (const n of store.ngos.values()) {
    if (n.status === "published") {
      published.push({
        ...n,
        area: n.area || "pune",
      } as PublicNgo);
    }
  }
  return published.sort((a, b) => a.name.localeCompare(b.name));
}

export function getMockNgoById(id: string): { row: NgoRow; priv: NgoPrivateRow | null } | null {
  const store = getStore();
  const row = store.ngos.get(id);
  if (!row) return null;
  const priv = store.privates.get(id) ?? null;
  return { row: { ...row }, priv: priv ? { ...priv } : null };
}

export function getMockNgoBySlug(slug: string): PublicNgo | null {
  const store = getStore();
  for (const n of store.ngos.values()) {
    if (n.slug === slug && n.status === "published") {
      return { ...n, area: n.area || "pune" } as PublicNgo;
    }
  }
  return null;
}

export function isMockSlugAvailable(slug: string, currentId: string | null): boolean {
  const store = getStore();
  for (const n of store.ngos.values()) {
    if (n.slug === slug && n.id !== currentId) {
      return false;
    }
  }
  return true;
}

export function saveMockNgo(row: NgoRow, priv: NgoPrivateRow): void {
  const store = getStore();
  store.ngos.set(row.id, { ...row });
  store.privates.set(row.id, { ...priv, ngo_id: row.id });
}

export function setMockPublished(id: string, publish: boolean): string | null {
  const store = getStore();
  const row = store.ngos.get(id);
  if (!row) return null;
  const nextStatus = publish ? "published" : "draft";
  const now = new Date().toISOString();
  row.status = nextStatus;
  row.updated_at = now;
  if (publish && !row.published_at) {
    row.published_at = now;
  }
  store.ngos.set(id, row);
  return nextStatus;
}

export function duplicateMockNgo(id: string): NgoRow | null {
  const store = getStore();
  const src = store.ngos.get(id);
  if (!src) return null;

  const base = slugify(`${src.slug}-copy`);
  const used = new Set<string>();
  for (const n of store.ngos.values()) used.add(n.slug);

  let slug = base;
  for (let i = 2; used.has(slug); i++) {
    slug = `${base}-${i}`;
  }

  const newId = randomUUID();
  const now = new Date().toISOString();
  const copy: NgoRow = {
    ...src,
    id: newId,
    name: `${src.name} (copy)`,
    slug,
    status: "draft",
    is_featured: false,
    created_at: now,
    updated_at: now,
    published_at: null,
  };
  store.ngos.set(newId, copy);

  const srcPriv = store.privates.get(id);
  if (srcPriv) {
    store.privates.set(newId, { ...srcPriv, ngo_id: newId });
  }

  return copy;
}

export function deleteMockNgo(id: string): boolean {
  const store = getStore();
  store.privates.delete(id);
  return store.ngos.delete(id);
}

export function deleteMockSampleNgos(): number {
  const store = getStore();
  let count = 0;
  for (const [id, n] of store.ngos.entries()) {
    if (n.is_sample) {
      store.ngos.delete(id);
      store.privates.delete(id);
      count++;
    }
  }
  return count;
}
