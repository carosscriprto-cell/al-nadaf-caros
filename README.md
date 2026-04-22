# Caros

Premium multilingual automotive storefront and lead-generation starter built with Next.js, TypeScript, and Tailwind CSS.

Caros is designed for car rental businesses, vehicle marketplaces, luxury mobility brands, and agencies that want a polished frontend product they can launch, customize, or resell. It combines a marketing website, bilingual inventory system, advanced vehicle search, dynamic listing pages, and WhatsApp-first conversion flows in one cohesive codebase.

## What This Product Is

Caros is a frontend-first automotive platform for showcasing rental and sale inventory with a premium user experience.

It is best suited for:

- car rental companies
- dealerships and auto marketplaces
- premium chauffeur and transport brands
- agencies building automotive websites for clients
- founders who want a strong UI starter before adding a custom backend

It solves a common product gap: many automotive websites look attractive but are difficult to localize, hard to customize, or weak at converting traffic into leads. Caros addresses that with a bilingual content system, structured vehicle data, localized SEO, strong search/filtering, and direct lead capture through WhatsApp.

## Core Features

- Multilingual app structure with locale-based routing under `app/[locale]`
- Arabic and English UI translations powered by `next-intl`
- Separate localized vehicle content layer for marketing copy, features, requirements, and warranty details
- Structured inventory model for rentals, vehicle sales, and mixed-mode listings
- Dynamic vehicle detail pages with localized metadata and social preview data
- URL-driven listing filters for shareable and bookmarkable inventory views
- Client-side multilingual search using Fuse.js with query normalization and intent-aware ranking
- Dedicated rental, sale, fleet, booking, contact, about, FAQ, and services pages
- WhatsApp-based lead flows for vehicle interest, booking, and contact requests
- Feature flags for sell-car, VIP delivery, WhatsApp, phone, and email contact behaviors
- Reusable premium UI sections for homepage storytelling, featured inventory, FAQs, testimonials, and conversion banners
- Embla-powered carousels and rich motion-based interactions
- Theme support with `next-themes`
- Interactive map module loaded client-side only for better rendering behavior

## Why It’s Valuable

Caros is not just a landing page. It already includes the product surfaces buyers usually need to commission separately:

- a premium homepage
- inventory browsing
- individual vehicle pages
- search and filtering
- multilingual content
- lead capture workflows
- SEO-ready route structure

That makes it useful both as a deployable project and as a commercial starter template.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `next-intl` for localization
- Framer Motion for animation
- Embla Carousel for sliders
- Fuse.js for client-side fuzzy search
- React Hook Form + Zod for form validation
- Radix UI primitives for interactive controls
- React Leaflet for the map experience
- Lucide React for icons

## Product Architecture

Caros is structured as a content-driven frontend application with clear separation between inventory data, localized copy, UI messages, and presentation components.

### Inventory Data

Vehicle inventory lives in:

- `data/cars.ts`

This file defines the core `Car` model and the full inventory dataset, including:

- rental pricing
- sale pricing
- media
- specs
- merchandising flags
- location data
- trust-related details such as ratings and ownership history

### Localized Vehicle Content

Localized per-vehicle marketing content lives in:

- `data/cars-content/en.ts`
- `data/cars-content/ar.ts`

This layer is separate from the base inventory and stores:

- localized titles
- short descriptions
- longer descriptions
- feature groups
- requirements
- included services
- warranty text

That separation makes the project easier to scale and easier to sell as a template because structured data and editorial copy are not mixed together.

### UI Translation Messages

General interface translations live in:

- `messages/en/*.json`
- `messages/ar/*.json`

Examples include:

- navigation
- buttons
- forms
- filters
- contact page copy
- FAQ copy
- UI labels and helper text

### Routing

User-facing routes are organized under:

- `app/[locale]/...`

Notable routes include:

- `/[locale]`
- `/[locale]/fleet`
- `/[locale]/fleet/[id]`
- `/[locale]/rental`
- `/[locale]/sales`
- `/[locale]/booking`
- `/[locale]/contact`
- `/[locale]/services`
- `/[locale]/about`
- `/[locale]/faq`

### Search and Filtering

Search logic is implemented in:

- `lib/search/*`

The system prepares a multilingual search index from both Arabic and English vehicle content, normalizes query input, and ranks results with Fuse.js. Listing filters are URL-driven, making filtered pages shareable and predictable.

### Conversion Layer

Lead generation is centralized around WhatsApp and direct contact actions.

Relevant modules include:

- `components/WhatsAppButton.tsx`
- `components/WhatsappFloatingButton.tsx`
- `lib/buildWhatsAppMessage.ts`
- contact and booking page flows

## Project Structure

```bash
app/                 # App Router pages, layouts, localized routes
components/          # Reusable UI sections, pages, hooks, map, providers
config/              # Brand, contact, feature flags, SEO config
data/                # Inventory, services, FAQs, localized car content
i18n/                # Message loading and request config
lib/                 # Search engine, WhatsApp message builder, helpers
messages/            # Arabic and English UI translation files
public/              # Static assets, images, icons
docs/                # Internal architecture notes and buyer-facing docs
```

## Getting Started

### Requirements

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

The middleware redirects `/` to `/en`, so localized routes are the default entry point.

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Environment and Configuration

This project is primarily config-driven and does not currently depend on a backend service or environment variable setup to run locally.

Most branding and business settings are defined in:

- `config/site.ts`
- `config/seo.ts`
- `config/features.ts`

You can update:

- brand name
- localized brand name
- phone numbers
- WhatsApp number
- email addresses
- address
- business hours
- social links
- website URL
- default SEO values
- feature flags

## How to Use and Extend It

### Add or Update Inventory

Edit:

- `data/cars.ts`

Each vehicle uses a structured `Car` model and supports:

- `rent`
- `sale`
- `both`

This allows one codebase to power rental inventory, cars-for-sale inventory, or a hybrid business model.

### Add Localized Vehicle Content

For every vehicle slug, add matching entries in:

- `data/cars-content/en.ts`
- `data/cars-content/ar.ts`

If localized car content is missing, the UI falls back to a generated title, but the full product experience is strongest when both content maps are kept complete.

### Customize Search

Search behavior is implemented in:

- `lib/search/buildIndex.ts`
- `lib/search/createSearch.ts`
- `lib/search/searchVehicles.ts`

This is where you would adjust:

- searchable fields
- ranking weights
- fuzzy match threshold
- intent-based sorting

### Customize Lead Flows

WhatsApp lead messaging is centralized in:

- `lib/buildWhatsAppMessage.ts`

That makes it easy to change lead copy once and have it propagate across car cards, detail pages, and related conversion actions.

### Add a Backend Later

The current project uses in-repo TypeScript data instead of a CMS or database. That makes it fast to launch and easy to resell.

If you want to evolve it into a live product, the easiest upgrade path is to replace:

- `data/cars.ts`
- `data/cars-content/*`

with CMS, API, or database-backed sources while preserving the existing UI and route structure.

## Localization

Localization is one of the strongest parts of this project.

### How It Works

- Locale routing is handled under `app/[locale]`
- UI translations are loaded from `messages/{locale}/*.json`
- Vehicle-specific localized content is loaded from `data/cars-content/*`
- `NextIntlClientProvider` is wired through `app/[locale]/NextIntlProvider.tsx`

### Translation Strategy

The project intentionally separates:

- UI copy in `messages/*`
- vehicle marketing content in `data/cars-content/*`

This keeps translations maintainable and avoids mixing interface text with product content.

### Supported Locales

- English
- Arabic

## SEO

SEO is already structured for multilingual growth.

Current implementation includes:

- global metadata in `app/[locale]/layout.tsx`
- config-driven defaults in `config/seo.ts`
- localized contact page metadata
- localized dynamic vehicle metadata in `app/[locale]/fleet/[id]/page.tsx`
- Open Graph and Twitter metadata support
- alternate language metadata for localized routes

This is especially useful for businesses that want each vehicle page to be discoverable and shareable as a standalone landing page.

## Buyer / Agency Notes

If you are evaluating this as a commercial product or starter kit, here is what matters most:

- the codebase is modular and readable
- the visual quality is already strong enough for client work
- the inventory model is richer than a basic brochure template
- the localization architecture is already in place
- the project is configurable without introducing a CMS on day one
- WhatsApp conversion flows are already integrated

This makes Caros a strong fit for:

- white-label delivery
- agency customization
- quick client launches
- premium marketplace or dealership prototypes

## What This Project Does Not Include

To keep expectations clear, the current codebase does not include:

- a database
- admin dashboard
- authentication
- payment processing
- reservation management backend
- CMS integration

It is best understood as a premium frontend starter and lead-generation system, not a complete end-to-end dealership ERP or booking backend.

## Recommended Customization Workflow

1. Update `config/site.ts` and `config/seo.ts`
2. Replace branding assets in `public/`
3. Replace or extend `data/cars.ts`
4. Add matching Arabic and English entries in `data/cars-content/*`
5. Update `messages/en/*` and `messages/ar/*`
6. Review WhatsApp copy in `lib/buildWhatsAppMessage.ts`
7. Adjust homepage sections and CTAs for your market

## Documentation

Additional internal notes already exist in:

- `docs/`

These are useful if you are adapting the project as a client template or reseller product.

## License

No license file is currently included in this repository.

If you plan to distribute, sell, or open-source this project, add the appropriate license before publishing.
