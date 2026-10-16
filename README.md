# NGOConnect 🤝
> **Find an NGO in Pune** · A free, community-first directory connecting citizens directly with grassroots organizations across Pune, Maharashtra.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Storage-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Project](https://img.shields.io/badge/Design_Thinking-PCCOE_Pune-orange?style=flat-square)](https://pccoepune.com/)

---

## 📌 Table of Contents

- [Overview & Mission](#-overview--mission)
- [Key Features](#-key-features)
  - [For Citizens & Donors](#for-citizens--donors)
  - [For NGOs](#for-ngos)
  - [For Administrators](#for-administrators)
- [Design Thinking Context](#-design-thinking-context)
- [Tech Stack](#-tech-stack)
- [Architecture & Security](#-architecture--security)
- [Database Schema & Storage](#-database-schema--storage)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Admin Setup CLI](#admin-setup-cli)
  - [Running Locally](#running-locally)
- [Available Scripts](#-available-scripts)
- [Production Deployment Guide](#-production-deployment-guide)
- [Non-Technical Overview (info.md)](#-non-technical-overview)
- [SEO & Accessibility](#-seo--accessibility)
- [Team & Acknowledgements](#-team--acknowledgements)
- [License & Disclaimer](#-license--disclaimer)

---

## 🌟 Overview & Mission

Many individuals want to support local causes—teaching underprivileged children, rescuing injured animals, participating in river cleanups, or supporting old-age homes—but finding verified grassroots organizations in their own neighbourhood is difficult. At the same time, smaller NGOs often operate without digital marketing teams, websites, or technical resources.

**NGOConnect** bridges this gap:
- **Zero Middlemen**: Direct links to call, WhatsApp, email, or visit NGOs.
- **No Financial Intermediary**: NGOConnect never collects money or takes platform fees; donations route directly to the NGO's verified accounts.
- **100% Free**: Always free for NGOs to get listed and for citizens to discover them.
- **Privacy First**: No tracking, no mandatory user accounts, and zero location harvesting.

---

## 🚀 Key Features

### For Citizens & Donors
- 🔍 **Instant Search**: Full-text, multi-keyword search matching NGO names, descriptions, activities, causes, and localities (e.g., `"education Kothrud"`).
- 📍 **"Near Me" Geolocation**: Uses the browser's Geolocation API and Haversine distance calculations to sort NGOs by proximity to the user's current location in Pune.
- 🏷️ **15 Cause Categories**: Filter by Education, Child Welfare, Women Empowerment, Animal Welfare, Environment, Health & Medical, Elderly Care, Hunger & Food, Mental Health, and more.
- 🏘️ **28 Pune Localities**: Browse localized hubs covering Kothrud, Baner, Hinjewadi, Aundh, Chinchwad, Nigdi, Viman Nagar, Kharadi, Hadapsar, Swargate, and beyond.
- 🤝 **Ways to Help**: Filter NGOs by contribution type—*Donate Money*, *Donate Items*, *Volunteer*, *Internships*, *Pro-bono Skills*, or *Events & Drives*.
- 📞 **1-Tap Direct Contact**: Direct links to initiate phone calls, open WhatsApp chats, compose pre-filled emails, or open exact coordinates in Google Maps.
- 🖼️ **Rich Profiles & Photo Galleries**: Inspect verified information, registration numbers (Trust / Society / Section 8), visiting hours, languages spoken, and activity photo galleries.
- 📤 **Native Web Sharing**: Seamless sharing of profiles via native mobile share sheets or fallback clipboard copy.

### For NGOs
- 📝 **Frictionless Onboarding**: NGOs can request a free listing via pre-formatted WhatsApp or email templates without creating an account or navigating complex portals.
- 💳 **Direct Donation Links**: Profile links direct donors straight to the NGO's official UPI/payment page.

### For Administrators
- 🕵️ **Stealth Admin Panel**:
  - Hidden behind dynamic Edge Middleware rewrites.
  - The admin panel operates at an unguessable URL path configured via `ADMIN_PATH`.
  - Unauthorized visitors receive an authentic `404 Not Found` response—no login redirect or detectable footprint.
  - Independent scrypt password verification and HMAC-SHA256 encrypted session cookies (no heavy auth provider dependencies).
- 🖥️ **Live Dual-Viewport Preview**: Split-screen editing with real-time synchronized previews in desktop and mobile container query modes.
- 🗺️ **Automatic Coordinate Parsing**: Extracts exact latitude and longitude directly from pasted Google Maps links.
- 🗜️ **Client-Side Image Compressor**: Compresses and re-encodes photos to modern WebP format in the browser (down to ~100–400 KB) before uploading to Supabase Storage.
- 🔒 **Private Metadata Isolation**: Keeps contact person phone numbers, internal verification notes, and submission dates in an isolated table inaccessible to the public.
- 🧹 **Sample Data Management**: 1-click sample listing deletion to clean demo data prior to production deployment.

---

## 💡 Design Thinking Context

This platform was conceptualized and developed as a **Design Thinking** project by Second Year (SY) Computer Engineering students at **PCCoE (Pimpri Chinchwad College of Engineering), Pune**.

The design process involved:
1. **Empathize**: Interviewed local Pune citizens about their hurdles in finding trustable local NGOs, and surveyed grassroots charity representatives about their digital visibility challenges.
2. **Define**: Discovered that citizens abandoned volunteering/donating when faced with third-party payment gateways, commission-taking platforms, or broken contact numbers.
3. **Ideate**: Envisioned a lightning-fast, zero-friction directory that functions like a direct digital phonebook with modern search and proximity sorting.
4. **Prototype**: Iterated UI components using cohesive warm tones (Cobalt, Lime, Peach, Ice, Paper) and container-query enabled live previews.
5. **Test**: Tested with student volunteers and community groups to refine contact workflows and filter UX.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15.5](https://nextjs.org/) | App Router, Server Components, Server Actions, Dynamic ISR (`revalidate = 3600`) |
| **Library** | [React 19](https://react.dev/) | React 19 Client & Server components |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type-safety across database models, forms, and routes |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Tailwind CSS v4 `@theme`, container queries (`@container`), custom palette |
| **Database** | [Supabase PostgreSQL](https://supabase.com/) | Relational database with strict Row Level Security (RLS) policies |
| **Object Storage**| [Supabase Storage](https://supabase.com/storage) | Public-read, service-role-write bucket for compressed NGO photos (`ngo-images`) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) | Validated form state management and schema enforcement |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible iconography |
| **Typography** | [next/font/google](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) | *Bricolage Grotesque* (display), *DM Sans* (body), *Caveat* (handwritten accents) |

---

## 📐 Architecture & Security

```
[ Client Browser ]
        │
        ├── (Public Routes: /, /ngos, /causes, /areas, /about, /list-your-ngo)
        │      └── Next.js App Router (ISR & Server Components)
        │             └── Supabase Client (Anon Key -> Reads ONLY published NGOs via RLS)
        │
        └── (Secret Admin Route: e.g. /studio-x7f9a2/...)
               │
               ▼
        [ Next.js Edge Middleware ]
               ├── Validates encrypted HMAC-SHA256 session cookie
               ├── If unauthenticated: Rewrites request to /__not-found (404)
               └── If valid: Rewrites internally to /x-admin/* (X-Robots-Tag: noindex)
                      │
                      ▼
               [ Admin Server Actions ]
                      └── Supabase Admin Client (Service Role Key -> Full Read/Write/Private Data)
```

### Security Highlights
- **Edge Middleware Masking**: The true admin prefix `/x-admin` is never exposed. Requests without a valid signed session return genuine 404 pages to prevent enumeration.
- **Scrypt Password Hashing**: Passwords are saved as cryptographically salted `scrypt` hashes in environment secrets (`ADMIN_PASSWORD_HASH`).
- **Postgres Row Level Security (RLS)**: Public anonymous clients can *only* execute `SELECT` on rows where `status = 'published'`. All mutations and access to the `ngo_private` table require the server-side `SUPABASE_SERVICE_ROLE_KEY`.

---

## 🗄️ Database Schema & Storage

### Tables
1. **`public.ngos`**:
   - `id` (UUID, Primary Key)
   - `slug` (Unique slug, URL safe)
   - `name`, `tagline`, `description`, `activities` (Text array)
   - `causes` (Array of cause slugs, GIN indexed)
   - `help_types` (Array of support slugs)
   - `area` (Area slug, indexed)
   - `address`, `maps_url`, `lat`, `lng` (Geolocation)
   - `phone`, `whatsapp`, `email`, `website`, `donation_link`
   - `instagram`, `facebook`, `linkedin`, `youtube`
   - `founded_year`, `registration_type`, `registration_number`, `visiting_hours`, `languages`
   - `logo_url`, `cover_url`, `gallery_urls` (Up to 6 images)
   - `is_featured`, `status` (`'draft'` | `'published'`), `is_sample`
   - `created_at`, `updated_at`, `published_at`
2. **`public.ngo_private`**:
   - `ngo_id` (UUID, Foreign Key referencing `ngos.id` on delete cascade)
   - `contact_person`, `contact_person_phone`
   - `internal_notes`, `data_received_on`

### Storage
- **Bucket**: `ngo-images` (Public bucket for reading logos, covers, and gallery images; uploads strictly restricted to backend service-role operations).

---

## 📂 Directory Structure

```text
DT - Website/
├── public/                 # Static assets and sample SVG illustrations
├── scripts/
│   └── admin-setup.mjs     # Interactive CLI to generate scrypt hash & admin path
├── src/
│   ├── app/
│   │   ├── (admin)/        # Internal admin route handlers (rewritten by middleware)
│   │   │   └── x-admin/    # Dashboard, NGO editor, image uploader, live preview
│   │   ├── (public)/       # Public visitor routes
│   │   │   ├── about/      # Design Thinking project background & team info
│   │   │   ├── areas/      # Area-specific NGO listings (/areas/[area])
│   │   │   ├── causes/     # Cause-specific NGO listings (/causes/[cause])
│   │   │   ├── list-your-ngo/ # Free onboarding guide & contact template
│   │   │   └── ngos/       # Main directory search, filters & profiles (/ngos/[slug])
│   │   ├── globals.css     # Design tokens & Tailwind theme definitions
│   │   ├── layout.tsx      # Root HTML layout with Google Font variables
│   │   ├── robots.ts       # Automated robots.txt generator
│   │   └── sitemap.ts      # Dynamic sitemap with cause/area/NGO static routes
│   ├── components/
│   │   ├── admin/          # Live preview, NGO table, forms, image uploaders
│   │   ├── directory/      # Search inputs, cause grid, filters sidebar, near-me button
│   │   ├── layout/         # Header, footer, logo, and page intro banners
│   │   ├── ngo/            # NGO profile view, contact bar, cards, gallery, brand icons
│   │   └── ui/             # Reusable UI primitives (Buttons, Chips, Badges, Modals, Toasts)
│   ├── config/             # Static configurations (areas, causes, help types, site meta)
│   ├── lib/                # Utilities: geo calculations, image compression, auth, Supabase
│   └── middleware.ts       # Edge middleware for secret admin routing & masking
├── supabase/
│   ├── migrations/         # PostgreSQL schema, triggers, and RLS policies
│   └── seed.sql            # Demo sample listings in Pune for testing
├── .env.example            # Environment variable template
├── next.config.ts          # Next.js image domain whitelist & server actions config
└── package.json            # Project dependencies and operational scripts
```

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v20.x or newer
- [npm](https://www.npmjs.com/) or compatible package manager
- *(Optional)* A [Supabase](https://supabase.com/) project (only if you want persistent cloud PostgreSQL/Storage; the demo prototype runs 100% self-contained without it)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ngoconnect.git
   cd ngoconnect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

```env
# --- Supabase Configuration ---
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-service-role-key

# --- Admin Panel ---
ADMIN_PATH=/admin                  # URL path for admin panel (default: /admin)
ADMIN_USERNAME=pccoeadmin          # Admin login username (default: pccoeadmin)
ADMIN_PASSWORD=admin@123           # Admin login password (default: admin@123)
ADMIN_PASSWORD_HASH=               # Optional scrypt hash
ADMIN_SESSION_SECRET=              # Optional custom signing key for cookies

# --- Site URL ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Admin Access & Default Credentials

The admin portal is accessible at **`/admin`** (or through the "Admin Portal" link in the footer).

- **URL**: `http://localhost:3000/admin` (automatically routes to login if not authenticated)
- **Login / Username**: `pccoeadmin`
- **Password**: `admin@123`

*(Optional)* You can also run `npm run admin:setup` to generate custom scrypt password hashes and custom secret paths.

This interactive prompt will:
1. Ask you for a secure master password (minimum 10 characters).
2. Generate an `scrypt` hash with random salt.
3. Generate a cryptographically secure session signing key.
4. Assign a randomized secret admin URL path (e.g. `/studio-a71c89`).
5. Automatically write these values into your `.env.local` file.

### Running Locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
To access the admin panel, navigate to [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🚀 Production Deployment Guide

Deploying NGOConnect to **Vercel** (or any Node.js / container host) takes less than 3 minutes:

### 1. Push Code to GitHub / Git Provider
Ensure your repository is pushed to GitHub, GitLab, or Bitbucket.

### 2. Connect to Vercel
1. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
2. Select this repository. Next.js will be detected automatically.

### 3. Add Production Environment Variables (Optional)
The prototype is **100% self-contained** and can be deployed with **ZERO keys or environment variables**! 

If you want to configure custom admin credentials or connect a live Supabase PostgreSQL database later, you can optionally configure:

| Variable | Value / Description | Required? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Your live production domain (e.g. `https://ngoconnect.vercel.app`) | Optional (recommended for SEO canonical URLs) |
| `ADMIN_PATH` | `/admin` (or custom path like `/studio`) | Optional (defaults to `/admin`) |
| `ADMIN_USERNAME` | `pccoeadmin` (or custom admin username) | Optional (defaults to `pccoeadmin`) |
| `ADMIN_PASSWORD` | `admin@123` (or custom admin password) | Optional (defaults to `admin@123`) |
| `ADMIN_SESSION_SECRET` | A 32+ character random secret string | Optional (built-in fallback provided) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (`https://xyz.supabase.co`) | Optional (cloud database sync) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Publishable / Anon Key | Optional (cloud database sync) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Optional (cloud write bypass) |

### 4. Deploy!
Click **Deploy**. Vercel will run `npm run build`, compile all 61+ static and dynamic pages with zero errors, and launch your site with Edge Middleware and global CDN caching.

---

## 📘 Non-Technical Overview

For a plain-English, non-technical explanation of the project, problem statement, community impact, and Design Thinking methodology (suitable for academic presentations, juries, and general readers), see:

👉 **[`info.md`](info.md)**

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `localhost:3000` |
| `npm run build` | Compiles an optimized production build and validates types |
| `npm run start` | Boots the Next.js production server |
| `npm run lint` | Runs ESLint 9 to verify code quality and consistency |
| `npm run admin:setup` | Interactive Node.js script to generate admin password hash and secret route |

---

## ⚡ SEO & Accessibility

- **Semantic HTML5 & WAI-ARIA**: Proper heading hierarchy, landmark roles, skip-friendly navigation, and descriptive `aria-label` tags on all icon buttons.
- **Schema.org Structured Data**: Generates `application/ld+json` schema for each NGO (`@type: NGO`, `PostalAddress`, `GeoCoordinates`, `sameAs` social links).
- **Automated Sitemap & Robots**: Generated dynamically at `/sitemap.xml` and `/robots.txt` based on published NGOs and active categories.
- **Reduced Motion**: Respects `prefers-reduced-motion` to disable animations for accessibility.
- **Dynamic OpenGraph**: Pre-configured OG titles, descriptions, and preview images for social media sharing.

---

## 👥 Team & Acknowledgements

Developed as a **Design Thinking Project** at **Pimpri Chinchwad College of Engineering (PCCoE), Pune**:

- **Nirav Neve**
- **Samyak Janrao**

Special thanks to the local Pune NGOs and volunteers who participated in our user research interviews.

---

## 📄 License & Disclaimer

### Disclaimer
> **NGOConnect** is an informational directory listing details voluntarily provided by NGOs or gathered from publicly verifiable sources. NGOConnect does not handle donations, charge commissions, process payments, or formally audit any organization. Citizens are encouraged to contact organizations directly and exercise standard due diligence.

Distributed under the MIT License. Feel free to adapt this project for your own city or community!
