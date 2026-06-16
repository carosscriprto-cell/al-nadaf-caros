'use client';

// Full-page, type-driven create/edit form. Sections branch on listing type
// (sale / rent / both). Bilingual content via an EN/AR tab. Caros design.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Tag, KeyRound, Layers } from 'lucide-react';
import { Constants } from '@/lib/supabase/database.types';
import { carFormSchema, type CarFormValues, type ContentLocaleValues } from '@/lib/dashboard/carSchema';
import { type TenantFeatures, allowedListingTypes } from '@/lib/tenant/features';
import { createCar, updateCar } from '@/app/dashboard/cars/actions';
import type { DashCarWithContent } from '@/lib/dashboard/cars';
import { useDash } from '../DashboardI18n';
import { Section, TextField, NumField, SelField, SwitchField, TextareaField, TagInput } from './fields';
import ImagesField from './ImagesField';

const E = Constants.public.Enums;
const STATUSES = ['available', 'sold', 'reserved'] as const;
type Listing = 'sale' | 'rent' | 'both';

function emptyContent(): ContentLocaleValues {
  return { title: '', short_description: '', description: '', features: [], comfort_features: [], safety_features: [], entertainment_features: [], requirements: [], included_services: [], ideal_for: [], pros: [], cons: [], warranty: '' };
}
function contentFrom(car: DashCarWithContent | undefined, locale: 'en' | 'ar'): ContentLocaleValues {
  const r = car?.car_content?.find((c) => c.locale === locale);
  if (!r) return emptyContent();
  return {
    title: r.title ?? '', short_description: r.short_description ?? '', description: r.description ?? '',
    features: r.features ?? [], comfort_features: r.comfort_features ?? [], safety_features: r.safety_features ?? [],
    entertainment_features: r.entertainment_features ?? [], requirements: r.requirements ?? [], included_services: r.included_services ?? [],
    ideal_for: r.ideal_for ?? [], pros: r.pros ?? [], cons: r.cons ?? [], warranty: r.warranty ?? '',
  };
}

function initial(car: DashCarWithContent | undefined, listing: Listing): CarFormValues {
  return {
    brand: car?.brand ?? '', model: car?.model ?? '', year: car?.year ?? new Date().getFullYear(), trim: car?.trim ?? '',
    listing_type: listing, condition: car?.condition ?? 'used', category: car?.category ?? 'sedan', class: car?.class ?? 'standard',
    status: (car?.status as CarFormValues['status']) ?? 'available',
    available: car?.available ?? true, is_featured: car?.is_featured ?? false, is_hero: car?.is_hero ?? false,
    is_popular: car?.is_popular ?? false, is_new_arrival: car?.is_new_arrival ?? false, is_best_seller: car?.is_best_seller ?? false,
    currency: car?.currency ?? 'USD',
    price_total: car?.price_total ?? undefined, price_old: car?.price_old ?? undefined, negotiable: car?.negotiable ?? false,
    financing_available: car?.financing_available ?? false, monthly_installment: car?.monthly_installment ?? undefined,
    price_daily: car?.price_daily ?? undefined, price_weekly: car?.price_weekly ?? undefined, price_monthly: car?.price_monthly ?? undefined,
    price_hourly: car?.price_hourly ?? undefined, security_deposit: car?.security_deposit ?? undefined, min_rental_days: car?.min_rental_days ?? undefined,
    mileage_limit: car?.mileage_limit ?? undefined, insurance: car?.insurance ?? '',
    transmission: car?.transmission ?? 'automatic', fuel_type: car?.fuel_type ?? 'petrol', drivetrain: car?.drivetrain ?? undefined,
    seats: car?.seats ?? 5, doors: car?.doors ?? 4, mileage: car?.mileage ?? 0, color: car?.color ?? '', interior_color: car?.interior_color ?? '',
    engine: car?.engine ?? '', cylinders: car?.cylinders ?? undefined, horsepower: car?.horsepower ?? undefined, torque: car?.torque ?? undefined,
    top_speed: car?.top_speed ?? undefined, acceleration: car?.acceleration ?? '', fuel_tank_capacity: car?.fuel_tank_capacity ?? undefined,
    electric_range: car?.electric_range ?? undefined, fuel_city: car?.fuel_city ?? undefined, fuel_highway: car?.fuel_highway ?? undefined,
    fuel_combined: car?.fuel_combined ?? undefined, fuel_per_20km: car?.fuel_per_20km ?? undefined,
    thumbnail: car?.thumbnail ?? '', images: car?.images ?? [],
    city: car?.city ?? '', country: car?.country ?? '', address: car?.address ?? '', delivery_available: car?.delivery_available ?? false,
    pickup_locations: car?.pickup_locations ?? [],
    owners_count: car?.owners_count ?? undefined, accident_free: car?.accident_free ?? false, service_history: car?.service_history ?? false,
    content: { en: contentFrom(car, 'en'), ar: contentFrom(car, 'ar') },
  };
}

export default function CarFormPage({ car, features, tenantId }: { car?: DashCarWithContent; features: TenantFeatures; tenantId: string }) {
  const { t, el } = useDash();
  const cf = t.cf;
  const ph = cf.ph;
  const router = useRouter();
  const isEdit = !!car;
  // Stable car id for storage paths ({tenant}/cars/{carId}/). On create we mint
  // it client-side and pass it to createCar so the row uses the same id.
  const [carId] = useState<string>(() => car?.id ?? crypto.randomUUID());
  const allowed = allowedListingTypes(features);

  // Resolved listing type: edit→existing; single-type tenant→that type; else chooser.
  const initialListing: Listing | null = isEdit
    ? (car!.listing_type as Listing)
    : allowed.length === 1
    ? (allowed[0] === 'sale' ? 'sale' : 'rent')
    : null;

  const [listing, setListing] = useState<Listing | null>(initialListing);
  const [v, setV] = useState<CarFormValues>(() => initial(car, initialListing ?? 'sale'));
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof CarFormValues>(k: K, val: CarFormValues[K]) => setV((p) => ({ ...p, [k]: val }));
  const setC = <K extends keyof ContentLocaleValues>(k: K, val: ContentLocaleValues[K]) =>
    setV((p) => ({ ...p, content: { ...p.content, [locale]: { ...p.content[locale], [k]: val } } }));
  const errOf = (k: string) => (errors[k] ? cf.required : undefined);

  // ── Type chooser ──
  if (listing === null) {
    const choose = (l: Listing) => { setListing(l); setV((p) => ({ ...p, listing_type: l })); };
    const opts: { l: Listing; label: string; icon: typeof Tag }[] = [
      { l: 'sale', label: cf.typeSale, icon: Tag },
      { l: 'rent', label: cf.typeRent, icon: KeyRound },
      { l: 'both', label: cf.typeBoth, icon: Layers },
    ];
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink label={cf.backToList} />
        <h1 className="mt-4 text-2xl font-bold">{cf.chooseTitle}</h1>
        <p className="mt-1 text-sm text-[#8a9099]">{cf.chooseHint}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {opts.map((o) => {
            const Icon = o.icon;
            return (
              <button key={o.l} onClick={() => choose(o.l)} className="flex flex-col items-center gap-3 rounded-2xl border border-[#ececec] bg-white p-8 text-center transition hover:border-[#75ACE8] hover:shadow-lg">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#75ACE8]/10 text-[#75ACE8]"><Icon size={22} /></span>
                <span className="font-semibold">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const includeSale = listing === 'sale' || listing === 'both';
  const includeRent = listing === 'rent' || listing === 'both';
  const currencySel = (
    <SelField label={cf.currency} value={v.currency} onChange={(x) => set('currency', x as CarFormValues['currency'])} opts={E.currency} fmt={(o) => el('currency', o)} />
  );

  const submit = async () => {
    const parsed = carFormSchema.safeParse(v);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { const key = i.path.join('.'); if (!errs[key]) errs[key] = i.message; });
      setErrors(errs);
      // jump to the locale tab that has a content error
      const enErr = Object.keys(errs).some((k) => k.startsWith('content.en.'));
      const arErr = Object.keys(errs).some((k) => k.startsWith('content.ar.'));
      if (arErr && !enErr) setLocale('ar');
      else if (enErr) setLocale('en');
      toast.error(cf.fixFields);
      return;
    }
    setErrors({});
    setBusy(true);
    // Pass the client-minted id on create so the row matches the storage path.
    const res = isEdit ? await updateCar({ id: car!.id, values: v }) : await createCar({ ...v, id: carId });
    setBusy(false);
    if (!res.ok) {
      if (res.error.startsWith('LIMIT_MAX_CARS:')) toast.error(`${cf.limitReached} (${res.error.split(':')[1]})`);
      else if (res.error.startsWith('LIMIT_MAX_IMAGES:')) toast.error(`${cf.imgLimit} (${res.error.split(':')[1]})`);
      else toast.error(res.error);
      return;
    }
    toast.success(isEdit ? cf.updatedToast : cf.createdToast);
    router.push('/dashboard/cars');
    router.refresh();
  };

  const c = v.content[locale];

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-28">
      <BackLink label={cf.backToList} />
      <h1 className="text-2xl font-bold tracking-tight">{isEdit ? cf.editTitle : cf.addTitle}</h1>

      {/* Basics */}
      <Section title={cf.secBasics}>
        <TextField label={cf.brand} value={v.brand} onChange={(x) => set('brand', x)} err={errOf('brand')} placeholder={ph.brand} />
        <TextField label={cf.model} value={v.model} onChange={(x) => set('model', x)} err={errOf('model')} placeholder={ph.model} />
        <NumField label={cf.year} value={v.year} onChange={(x) => set('year', x ?? new Date().getFullYear())} err={errOf('year')} placeholder={ph.year} />
        <TextField label={cf.trim} value={v.trim ?? ''} onChange={(x) => set('trim', x)} placeholder={ph.trim} />
        <SelField label={cf.category} value={v.category} onChange={(x) => set('category', x as CarFormValues['category'])} opts={E.car_category} fmt={(o) => el('category', o)} />
        <SelField label={cf.class} value={v.class} onChange={(x) => set('class', x as CarFormValues['class'])} opts={E.car_class} fmt={(o) => el('class', o)} />
        <SelField label={cf.condition} value={v.condition} onChange={(x) => set('condition', x as CarFormValues['condition'])} opts={E.car_condition} fmt={(o) => el('condition', o)} />
      </Section>

      {/* Promotion & visibility */}
      <Section title={cf.secPromotion} cols={2}>
        <SelField label={cf.status} value={v.status} onChange={(x) => { const s = x as CarFormValues['status']; setV((p) => ({ ...p, status: s, available: s === 'available' })); }} opts={STATUSES} fmt={(o) => el('status', o)} />
        <div />
        <SwitchField label={cf.available} hint={v.status !== 'available' ? cf.showSoldHint : cf.availableHint} checked={v.available} onChange={(x) => set('available', x)} />
        <SwitchField label={cf.featured} hint={cf.featuredHint} checked={v.is_featured} onChange={(x) => set('is_featured', x)} />
        <SwitchField label={cf.hero} hint={cf.heroHint} checked={v.is_hero} onChange={(x) => set('is_hero', x)} />
        <SwitchField label={cf.popular} checked={v.is_popular} onChange={(x) => set('is_popular', x)} />
        <SwitchField label={cf.newArrival} checked={v.is_new_arrival} onChange={(x) => set('is_new_arrival', x)} />
        <SwitchField label={cf.bestSeller} checked={v.is_best_seller} onChange={(x) => set('is_best_seller', x)} />
      </Section>

      {/* Images */}
      <ImagesField
        tenantId={tenantId}
        carId={carId}
        images={v.images}
        thumbnail={v.thumbnail}
        maxImages={features.maxImagesPerCar}
        onChange={(images, thumbnail) => setV((p) => ({ ...p, images, thumbnail }))}
      />

      {/* Sale pricing & details */}
      {includeSale && (
        <Section title={cf.secSale}>
          {currencySel}
          <NumField label={cf.price_total} value={v.price_total} onChange={(x) => set('price_total', x)} err={errOf('price_total')} placeholder={ph.price_total} />
          <NumField label={cf.price_old} value={v.price_old} onChange={(x) => set('price_old', x)} placeholder={ph.price_old} />
          <SwitchField label={cf.negotiable} checked={v.negotiable} onChange={(x) => set('negotiable', x)} />
          {features.enableFinancing && <SwitchField label={cf.financing} checked={v.financing_available} onChange={(x) => set('financing_available', x)} />}
          {features.enableFinancing && <NumField label={cf.monthly_installment} value={v.monthly_installment} onChange={(x) => set('monthly_installment', x)} placeholder={ph.monthly_installment} />}
        </Section>
      )}

      {/* Ownership history (sale) */}
      {includeSale && (
        <Section title={cf.secOwnership} cols={2}>
          <NumField label={cf.owners_count} value={v.owners_count} onChange={(x) => set('owners_count', x)} placeholder={ph.owners_count} />
          <div />
          <SwitchField label={cf.accidentFree} checked={v.accident_free} onChange={(x) => set('accident_free', x)} />
          <SwitchField label={cf.serviceHistory} checked={v.service_history} onChange={(x) => set('service_history', x)} />
        </Section>
      )}

      {/* Rental pricing & terms */}
      {includeRent && (
        <Section title={cf.secRental}>
          {!includeSale && currencySel}
          <NumField label={cf.price_daily} value={v.price_daily} onChange={(x) => set('price_daily', x)} err={errOf('price_daily')} placeholder={ph.price_daily} />
          <NumField label={cf.price_weekly} value={v.price_weekly} onChange={(x) => set('price_weekly', x)} placeholder={ph.price_weekly} />
          <NumField label={cf.price_monthly} value={v.price_monthly} onChange={(x) => set('price_monthly', x)} placeholder={ph.price_monthly} />
          <NumField label={cf.price_hourly} value={v.price_hourly} onChange={(x) => set('price_hourly', x)} placeholder={ph.price_hourly} />
          <NumField label={cf.security_deposit} value={v.security_deposit} onChange={(x) => set('security_deposit', x)} placeholder={ph.security_deposit} />
          <NumField label={cf.min_rental_days} value={v.min_rental_days} onChange={(x) => set('min_rental_days', x)} placeholder={ph.min_rental_days} />
          <NumField label={cf.mileage_limit} value={v.mileage_limit} onChange={(x) => set('mileage_limit', x)} placeholder={ph.mileage_limit} />
          <TextField label={cf.insurance} value={v.insurance ?? ''} onChange={(x) => set('insurance', x)} placeholder={ph.insurance} />
        </Section>
      )}

      {/* Specs */}
      <Section title={cf.secSpecs}>
        <SelField label={cf.transmission} value={v.transmission} onChange={(x) => set('transmission', x as CarFormValues['transmission'])} opts={E.transmission} fmt={(o) => el('transmission', o)} />
        <SelField label={cf.fuel_type} value={v.fuel_type} onChange={(x) => set('fuel_type', x as CarFormValues['fuel_type'])} opts={E.fuel_type} fmt={(o) => el('fuel_type', o)} />
        <SelField label={cf.drivetrain} value={v.drivetrain ?? ''} onChange={(x) => set('drivetrain', (x || undefined) as CarFormValues['drivetrain'])} opts={E.drivetrain} fmt={(o) => el('drivetrain', o)} allowEmpty />
        <NumField label={cf.seats} value={v.seats} onChange={(x) => set('seats', x ?? 1)} err={errOf('seats')} placeholder={ph.seats} />
        <NumField label={cf.doors} value={v.doors} onChange={(x) => set('doors', x ?? 2)} err={errOf('doors')} placeholder={ph.doors} />
        <NumField label={cf.mileage} value={v.mileage} onChange={(x) => set('mileage', x ?? 0)} err={errOf('mileage')} placeholder={ph.mileage} />
        <TextField label={cf.color} value={v.color ?? ''} onChange={(x) => set('color', x)} err={errOf('color')} placeholder={ph.color} />
        <TextField label={cf.interior_color} value={v.interior_color ?? ''} onChange={(x) => set('interior_color', x)} placeholder={ph.interior_color} />
        <TextField label={cf.engine} value={v.engine ?? ''} onChange={(x) => set('engine', x)} placeholder={ph.engine} />
        <NumField label={cf.cylinders} value={v.cylinders} onChange={(x) => set('cylinders', x)} placeholder={ph.cylinders} />
        <NumField label={cf.horsepower} value={v.horsepower} onChange={(x) => set('horsepower', x)} placeholder={ph.horsepower} />
        <NumField label={cf.torque} value={v.torque} onChange={(x) => set('torque', x)} placeholder={ph.torque} />
        <NumField label={cf.top_speed} value={v.top_speed} onChange={(x) => set('top_speed', x)} placeholder={ph.top_speed} />
        <TextField label={cf.acceleration} value={v.acceleration ?? ''} onChange={(x) => set('acceleration', x)} placeholder={ph.acceleration} />
        <NumField label={cf.fuel_tank} value={v.fuel_tank_capacity} onChange={(x) => set('fuel_tank_capacity', x)} placeholder={ph.fuel_tank} />
        <NumField label={cf.electric_range} value={v.electric_range} onChange={(x) => set('electric_range', x)} placeholder={ph.electric_range} />
      </Section>

      {/* Fuel consumption */}
      <Section title={cf.secConsumption}>
        <NumField label={cf.fuel_city} value={v.fuel_city} onChange={(x) => set('fuel_city', x)} placeholder={ph.fuel_city} />
        <NumField label={cf.fuel_highway} value={v.fuel_highway} onChange={(x) => set('fuel_highway', x)} placeholder={ph.fuel_highway} />
        <NumField label={cf.fuel_combined} value={v.fuel_combined} onChange={(x) => set('fuel_combined', x)} placeholder={ph.fuel_combined} />
        <NumField label={cf.fuel_per20} value={v.fuel_per_20km} onChange={(x) => set('fuel_per_20km', x)} placeholder={ph.fuel_per20} />
      </Section>

      {/* Location & delivery */}
      <Section title={cf.secLocation}>
        <TextField label={cf.city} value={v.city} onChange={(x) => set('city', x)} err={errOf('city')} placeholder={ph.city} />
        <TextField label={cf.country} value={v.country} onChange={(x) => set('country', x)} err={errOf('country')} placeholder={ph.country} />
        <TextField label={cf.address} value={v.address ?? ''} onChange={(x) => set('address', x)} placeholder={ph.address} />
        <SwitchField label={cf.delivery} checked={v.delivery_available} onChange={(x) => set('delivery_available', x)} />
        <TagInput label={cf.pickup_locations} values={v.pickup_locations} onChange={(x) => set('pickup_locations', x)} hint={cf.tagHint} />
      </Section>

      {/* Content (bilingual) */}
      <Section title={cf.secContent} cols={1}>
        <div className="col-span-full -mt-1 flex gap-1 rounded-xl bg-[#f0f1f3] p-1">
          {(['en', 'ar'] as const).map((l) => (
            <button key={l} type="button" onClick={() => setLocale(l)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${locale === l ? 'bg-white text-[#1a1d21] shadow-sm' : 'text-[#8a9099] hover:text-[#1a1d21]'}`}>
              {l === 'en' ? cf.tabEn : cf.tabAr}
            </button>
          ))}
        </div>
        <TextField full label={cf.title} value={c.title} onChange={(x) => setC('title', x)} err={errOf(`content.${locale}.title`)} placeholder={ph.title} />
        <TextareaField label={cf.short_description} value={c.short_description ?? ''} onChange={(x) => setC('short_description', x)} err={errOf(`content.${locale}.short_description`)} placeholder={ph.short_description} />
        <TextareaField label={cf.description} value={c.description ?? ''} onChange={(x) => setC('description', x)} placeholder={ph.description} />
        <TagInput label={cf.features} values={c.features} onChange={(x) => setC('features', x)} hint={cf.tagHint} />
        <TagInput label={cf.comfort} values={c.comfort_features} onChange={(x) => setC('comfort_features', x)} hint={cf.tagHint} />
        <TagInput label={cf.safety} values={c.safety_features} onChange={(x) => setC('safety_features', x)} hint={cf.tagHint} />
        <TagInput label={cf.entertainment} values={c.entertainment_features} onChange={(x) => setC('entertainment_features', x)} hint={cf.tagHint} />
        <TagInput label={cf.ideal_for} values={c.ideal_for} onChange={(x) => setC('ideal_for', x)} hint={cf.tagHint} />
        <TagInput label={cf.pros} values={c.pros} onChange={(x) => setC('pros', x)} hint={cf.tagHint} />
        <TagInput label={cf.cons} values={c.cons} onChange={(x) => setC('cons', x)} hint={cf.tagHint} />
        {includeRent && <TagInput label={cf.requirements} values={c.requirements} onChange={(x) => setC('requirements', x)} hint={cf.tagHint} />}
        {includeRent && <TagInput label={cf.included_services} values={c.included_services} onChange={(x) => setC('included_services', x)} hint={cf.tagHint} />}
        <TextField full label={cf.warranty} value={c.warranty ?? ''} onChange={(x) => setC('warranty', x)} placeholder={ph.warranty} />
      </Section>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ececec] bg-white/90 px-5 py-3 backdrop-blur lg:ltr:pl-60 lg:rtl:pr-60">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-3">
          <Link href="/dashboard/cars" className="rounded-xl border border-[#ececec] px-5 py-2.5 text-sm font-semibold text-[#6b7178] hover:bg-[#f0f1f3]">{cf.backToList}</Link>
          <button onClick={submit} disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#75ACE8] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9] disabled:opacity-60">
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? cf.saving : isEdit ? cf.saveBtn : cf.createBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <Link href="/dashboard/cars" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7178] transition hover:text-[#1a1d21]">
      <ArrowLeft size={16} className="rtl:rotate-180" /> {label}
    </Link>
  );
}
