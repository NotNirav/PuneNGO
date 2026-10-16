// Site-wide settings. Edit these values; everything else reads from here.
// PLACEHOLDERS: replace the contact details below before launch.

export const site = {
  name: "NGOConnect",
  tagline: "Find an NGO in Pune",
  description:
    "A free directory of Pune NGOs. Search by cause and area, and contact them directly to donate or volunteer.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",
  city: "Pune",
  state: "Maharashtra",
  country: "IN",
  countryCallingCode: "+91",
  timeZone: "Asia/Kolkata",

  // Where NGOs send their details to get listed (no form backend — just links).
  contact: {
    email: "hello@ngoconnect.example", // PLACEHOLDER
    whatsapp: "+91 00000 00000", // PLACEHOLDER — international format
  },

  team: ["Nirav Neve", "Samyak Janrao"],
  college: "PCCoE, Pune",

  disclaimer:
    "NGOConnect lists information provided by NGOs. We don't handle donations or payments, and we don't verify or guarantee any organisation. Please contact NGOs directly.",
} as const;

export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/ngos", label: "All NGOs" },
  { href: "/causes", label: "Causes" },
  { href: "/about", label: "About" },
  { href: "/list-your-ngo", label: "List your NGO" },
] as const;
