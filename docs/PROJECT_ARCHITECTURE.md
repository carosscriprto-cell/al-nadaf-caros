# Car Marketplace Template Documentation

This document explains the current project architecture for buyers, agencies, and development teams using this template as a commercial automotive platform.

It reflects the existing implementation exactly and is intended to make customization straightforward without changing the design system or UI structure.

## 1. Car Data System

Primary source:
- `data/cars.ts`

### Purpose

`cars.ts` is the core inventory source for the template. It contains the base vehicle records used by:
- home search
- listing pages
- vehicle detail pages
- filters
- WhatsApp lead generation
- SEO metadata lookup

### Car model structure

Each vehicle follows the `Car` type in `data/cars.ts`.

Core identity fields:
- `id`
- `slug`
- `brand`
- `model`
- `trim`
- `year`

Commercial fields:
- `listingType`
- `condition`
- `pricing`
- `available`
- merchandising flags such as `isFeatured`, `isPopular`, `isNewArrival`, `isBestSeller`

Specification fields:
- `category`
- `class`
- `transmission`
- `fuelType`
- `drivetrain`
- `seats`
- `doors`
- `mileage`
- engine and performance fields

Location and media fields:
- `city`
- `country`
- `address`
- `deliveryAvailable`
- `pickupLocations`
- `thumbnail`
- `images`

### Listing types

Supported listing types:
- `rent`
- `sale`
- `both`

How they behave:
- `rent`: vehicle is treated as rental inventory and uses rental pricing such as `daily`, `weekly`, `monthly`.
- `sale`: vehicle is treated as sale inventory and uses `total`, `oldPrice`, financing fields, and sale-oriented CTAs.
- `both`: vehicle is eligible for both rental and sale flows, appears in both contexts, and the UI exposes both commercial actions.

### Buyer note

To add inventory, duplicate an existing object in `data/cars.ts`, assign a unique `slug`, and keep pricing/media/location complete. The `slug` is the shared key that connects data, localization, search, SEO, and detail pages.

## 2. Car Content System

Primary sources:
- `data/cars-content/ar.ts`
- `data/cars-content/en.ts`
- `data/cars-content/types.ts`
- `data/cars-content/index.ts`
- `data/cars-content/useCarContent.ts`

### Purpose

The car content system stores localized marketing content separately from the structured inventory data in `cars.ts`.

This separation keeps:
- operational vehicle data in one place
- localized sales copy in another

### CarContentMap structure

Defined in `data/cars-content/types.ts`:

- `CarContentMap = Record<string, CarContentEntry>`

Each key is a vehicle `slug`.

Each `CarContentEntry` may contain:
- `title`
- `shortDescription`
- `description`
- `overview`
- `features`
- `comfortFeatures`
- `safetyFeatures`
- `entertainmentFeatures`
- `requirements`
- `includedServices`
- `warranty`

### Locale files

- `data/cars-content/en.ts` contains English content
- `data/cars-content/ar.ts` contains Arabic content

Each file exports a localized map keyed by the same car `slug` used in `cars.ts`.

### How the UI resolves localized content

The lookup flow is:
1. A page or component receives the active locale.
2. `getCarContentMap(locale)` or `useCarContentMap(locale)` loads the proper map.
3. The UI reads content by `contentMap[car.slug]`.
4. If localized content is missing, the system falls back to a generated title via `getCarTitleFallback(car)`.

This is how components such as:
- `components/CarCard.tsx`
- `components/pages/FleetDetailClient.tsx`
- `app/[locale]/fleet/[id]/page.tsx`

pull localized titles and descriptions without duplicating content logic.

### Buyer note

When adding a new vehicle:
1. Add the car object to `data/cars.ts`
2. Add the same slug to `data/cars-content/en.ts`
3. Add the same slug to `data/cars-content/ar.ts`

If the slug does not exist in both content files, the vehicle will still render, but the marketing copy will fall back to the basic title.

## 3. Search System

Primary sources:
- `lib/search/normalize.ts`
- `lib/search/buildIndex.ts`
- `lib/search/createSearch.ts`
- `lib/search/searchVehicles.ts`
- `components/HomeVehicleSearchForm.tsx`
- `components/pages/CarsListingPage.tsx`

### Overview

The template uses a shared multilingual search layer for both:
- the home search form
- the main listing pages

This avoids duplicated search logic and keeps ranking behavior consistent across the product.

### How search works

#### Step 1: normalization

`lib/search/normalize.ts` standardizes input for Arabic and English by:
- lowercasing
- removing special characters
- collapsing extra whitespace
- normalizing Arabic characters:
  - `أ`, `إ`, `آ` -> `ا`
  - `ة` -> `ه`
  - `ى` -> `ي`

This improves match quality for bilingual queries and minor text variation.

#### Step 2: search index preparation

`lib/search/buildIndex.ts` creates a searchable vehicle dataset by combining:
- structured car data from `cars.ts`
- Arabic content from `data/cars-content/ar.ts`
- English content from `data/cars-content/en.ts`

Each prepared vehicle includes:
- `_searchText`
- `_searchFields`

That index contains brand, model, category, class, localized titles, descriptions, and feature content.

#### Step 3: Fuse.js engine creation

`lib/search/createSearch.ts` builds a reusable Fuse instance with:
- fuzzy matching
- weighted keys
- `ignoreLocation`
- a threshold optimized for tolerant search behavior

This allows:
- typo tolerance
- partial matching
- better ranking than `.includes()` filtering

#### Step 4: ranking and intent handling

`lib/search/searchVehicles.ts` is the shared ranking engine.

It supports:
- Arabic and English queries
- exact and fuzzy matching
- brand/model/content matches
- intent-based ranking such as:
  - `cheap`, `رخيص`, `اقتصادي`
  - `luxury`, `غالي`, `فاخر`

When price intent is detected, results are re-ranked toward lower-cost or higher-end inventory.

### Home search flow

Implemented in `components/HomeVehicleSearchForm.tsx`.

Behavior:
- prepares the shared index with `prepareCarsForSearch`
- creates one memoized Fuse instance
- debounces the search query
- searches only within the currently selected mode: `rent`, `sale`, or `both`
- shows preview results and fallback suggestions
- routes the user to listing pages or directly to a vehicle page

### Listing page search flow

Implemented in `components/pages/CarsListingPage.tsx`.

Behavior:
- normalizes the `search` query from URL params
- runs `searchVehicles(...)` first
- applies the rest of the filters after search
- sorts the filtered result set
- paginates the final output

### Filtering pipeline

Current listing pipeline:
1. prepare multilingual searchable cars
2. run ranked search from the URL `search` value
3. apply structured filters such as brand, category, price, and seats
4. apply sort order
5. paginate the final result set

This preserves compatibility between full-text search and faceted filtering.

## 4. Filters System

Primary sources:
- `components/CarsFilters.tsx`
- `components/ActiveFilters.tsx`
- `components/pages/CarsListingPage.tsx`

### Overview

The filters system is URL-driven. The current filter state lives in the query string, which makes filtered pages:
- shareable
- reload-safe
- bookmarkable

### Supported filters

Current supported filters include:
- `search`
- `brand`
- `category`
- `transmission`
- `class`
- `fuelType`
- `seats`
- `minPrice`
- `maxPrice`
- `condition`
- `delivery`
- `sort`
- optional `type` on pages that expose listing-type switching

### How filters update URL state

`components/CarsFilters.tsx` uses:
- `useSearchParams()`
- `usePathname()`
- `useRouter()`

The update flow is:
1. read current query params
2. keep local UI state where needed
3. write changes back with `router.replace(...)`
4. keep the URL as the single persistent source of truth

### Search input behavior

The search field inside `CarsFilters` is intentionally decoupled from the URL while the user is typing.

Current behavior:
- local input state updates immediately
- the input is debounced with `useDebouncedValue(search, 350)`
- only the debounced value updates the URL

This prevents:
- cursor jumping
- Arabic typing flicker
- rerender loops from direct `searchParams` syncing

### Filter rendering

The UI uses existing shared controls:
- chip-style toggles for brand/category/transmission
- select controls for condition, fuel type, class, seats
- slider and inputs for price range
- a mobile sheet using the same filter logic

No visual logic is duplicated across mobile and desktop.

## 5. WhatsApp System

Primary sources:
- `lib/buildWhatsAppMessage.ts`
- `components/WhatsAppButton.tsx`
- `components/CarCard.tsx`
- `components/pages/FleetDetailClient.tsx`
- `app/[locale]/contact/page.tsx`
- `app/[locale]/booking/page.tsx`

### Centralized WhatsApp builder

The project uses one shared message builder:
- `buildWhatsAppMessage(...)`

This is the single source of truth for vehicle WhatsApp lead copy.

### Why duplication must be avoided

Keeping all CTA messaging in one function prevents:
- inconsistent lead messages between cards and detail pages
- missing business fields in some CTAs
- translation drift between English and Arabic
- future maintenance issues when pricing or wording changes

In a commercial template, a buyer should only need to update WhatsApp formatting once.

### How the message is constructed

`buildWhatsAppMessage` receives:
- `car`
- `locale`
- optional localized `content`

It builds a localized message that includes:
- car name
- listing type
- price
- location when available

Message sources:
- vehicle identity from `cars.ts`
- localized title from `data/cars-content`
- localized copy labels from the builder itself

Price behavior:
- rental vehicles use daily pricing
- sale vehicles use total price
- `both` vehicles include both rental and sale pricing in one message

### CTA usage across the product

The shared `WhatsAppButton` component is used as the CTA layer across the UI.

Current usage includes:
- vehicle cards in `components/CarCard.tsx`
- vehicle detail CTAs in `components/pages/FleetDetailClient.tsx`
- WhatsApp-oriented handoff flows on contact and booking pages

### Buyer note

To customize lead wording, edit only:
- `lib/buildWhatsAppMessage.ts`

That change will propagate to all car-aware WhatsApp CTAs that use the shared button/builder flow.

## 6. SEO Architecture

Primary sources:
- `app/[locale]/fleet/[id]/page.tsx`
- `app/[locale]/layout.tsx`
- `config/seo.ts`
- `config/index.ts`

### Dynamic route structure

Vehicle pages are served from:
- `/[locale]/fleet/[slug]`

The route folder is currently:
- `app/[locale]/fleet/[id]/page.tsx`

Internally, the page resolves either:
- the numeric/string `id`
- or the SEO-friendly `slug`

The canonical SEO path uses the slug version.

### Per-vehicle metadata

`app/[locale]/fleet/[id]/page.tsx` includes `generateMetadata(...)` for each car.

Current metadata sources:
- localized title from `data/cars-content`
- localized short description or description from `data/cars-content`
- thumbnail image from `cars.ts`

### Metadata features

Per vehicle, the page sets:
- localized `title`
- localized `description`
- Open Graph title and description
- Open Graph image
- canonical URL
- alternate language links for Arabic and English
- Twitter image metadata

### Why this matters

For a dealership or rental company, per-vehicle metadata improves:
- search engine indexing
- social sharing quality
- campaign landing page quality
- bilingual discoverability

### SEO strategy per vehicle page

Current SEO strategy is:
- one indexable route per vehicle
- localized content for page title and description
- stable canonical URLs using the slug
- alternate locale mapping between `/en` and `/ar`
- server-rendered route-level metadata generation

## 7. Performance System

Primary sources:
- `components/CarCard.tsx`
- `components/pages/FleetDetailClient.tsx`
- `components/HeroSection.tsx`
- `components/home/FeaturedCarsSection.tsx`
- `components/HomeVehicleSearchForm.tsx`
- `components/map/MapSection.tsx`
- `components/pages/CarsListingPage.tsx`

### Image optimization

The template uses `next/image` for responsive image delivery.

Current implementation includes:
- responsive `sizes` on cards and preview images
- `priority` on above-the-fold images where relevant
- lazy loading for non-priority images through the default `next/image` behavior

Typical optimization pattern:
- hero and first-row listing images get priority
- lower-visibility images remain lazy

### Lazy loading strategy

Heavy client-only modules can be deferred.

Example:
- `components/map/MapSection.tsx` uses `dynamic(..., { ssr: false })` to load the interactive map client-side only

This reduces unnecessary server work for non-critical visual modules.

### Search performance tradeoffs

The search engine is optimized on the client with:
- memoized indexed car data
- a memoized Fuse instance
- normalized search input
- shared search logic instead of repeated per-component filtering

Tradeoff:
- this is fast for template-scale inventory
- it still ships the searchable dataset to the browser

For most template buyers, this is acceptable. For very large live inventories, a server-backed or database-backed search layer would be the next scaling step.

### Pagination approach

The main listing page paginates client-side.

Current implementation:
- `ITEMS_PER_PAGE = 9`
- search and filters run first
- the filtered result set is then sliced for the active page

This is simple and effective for a template product and keeps the UX responsive without backend dependencies.

## 8. UI System

Primary sources:
- `components/`
- `components/ui/`
- `app/[locale]/layout.tsx`
- `components/providers/ThemeProvider.tsx`

### Shared design system

The project uses a shared component-driven UI architecture with:
- page sections in `components/`
- reusable primitives in `components/ui/`
- Tailwind utility styling
- Radix UI building blocks for interactive controls
- motion enhancements via `framer-motion`

This keeps the interface consistent across:
- home
- listings
- vehicle detail pages
- contact and FAQ pages

### Dark and light mode

Theme support is enabled through:
- `components/providers/ThemeProvider.tsx`
- `next-themes`

The locale layout wraps the full application with the theme provider and enables:
- system theme support
- dark/light class switching
- transition-safe hydration handling

### Reusable components strategy

Examples of shared UI architecture:
- `CarCard` for vehicle presentation
- `CarsFilters` for faceted browsing
- `WhatsAppButton` for lead conversion
- `FAQSection` for accordion-based FAQ rendering
- skeleton components for loading states

The project favors reusing behavior-rich components rather than rebuilding the same logic per page.

## 9. Customization Guide

This section covers the most common buyer-side modifications.

### Change car data

Edit:
- `data/cars.ts`

Typical changes:
- add or remove vehicles
- update pricing
- update city/country
- change listing type
- update thumbnails and gallery images

Important:
- keep each `slug` unique
- keep pricing aligned with the listing type

### Add a new vehicle

Recommended process:
1. Add the vehicle object to `data/cars.ts`
2. Add the same slug to `data/cars-content/en.ts`
3. Add the same slug to `data/cars-content/ar.ts`
4. Add image assets under `public/` and reference them in `thumbnail` and `images`

### Edit translations

The project uses `next-intl` messages for UI copy and `data/cars-content` for localized vehicle marketing content.

Edit UI translations in:
- `messages/en/*.json`
- `messages/ar/*.json`

Edit vehicle-specific localized content in:
- `data/cars-content/en.ts`
- `data/cars-content/ar.ts`

Rule of thumb:
- UI labels belong in `messages`
- car marketing copy belongs in `data/cars-content`

### Update the WhatsApp message

Edit:
- `lib/buildWhatsAppMessage.ts`

This is the correct place to:
- change message wording
- add or remove business fields
- adjust Arabic or English lead copy

Avoid editing CTA components individually. The message builder is intentionally centralized.

### Modify filters

Edit filter UI and URL behavior in:
- `components/CarsFilters.tsx`

Edit filter application logic in:
- `components/pages/CarsListingPage.tsx`

Best practice:
- if a new filter should appear in the UI, add its URL param handling in `CarsFilters.tsx`
- then apply the actual filtering condition in `CarsListingPage.tsx`

This keeps the system consistent and avoids partial filter behavior.

## Recommended Buyer Workflow

For most deployments, the cleanest customization order is:
1. replace inventory in `data/cars.ts`
2. add Arabic and English car content in `data/cars-content`
3. update UI translations in `messages`
4. update WhatsApp lead wording in `lib/buildWhatsAppMessage.ts`
5. review global SEO settings in `config/seo.ts` and `config/index.ts`
6. replace placeholder images and branding assets in `public/`

## Summary

This template is structured as a bilingual, conversion-oriented automotive frontend with:
- centralized inventory data
- localized per-car content
- shared multilingual search
- URL-based filters
- a single WhatsApp lead message system
- per-vehicle SEO metadata
- reusable UI architecture

For buyers, the main operational editing surfaces are:
- `data/cars.ts`
- `data/cars-content/en.ts`
- `data/cars-content/ar.ts`
- `messages/en/*`
- `messages/ar/*`
- `lib/buildWhatsAppMessage.ts`

That makes the project straightforward to resell, localize, and adapt for dealerships, rental agencies, and automotive lead-generation businesses.
