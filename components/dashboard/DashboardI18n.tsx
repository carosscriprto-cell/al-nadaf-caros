'use client';

// Dashboard i18n — shared lang (en/ar) + RTL, persisted to a cookie. The
// dashboard sits outside the storefront [locale] tree, so it owns its own
// dictionary (mirrors the storefront enum labels, completed for the
// market-complete enums) and an `el()` enum-label helper.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type DashLang = 'en' | 'ar';

type EnumMap = Record<string, string>;
type EnumGroups = {
  category: EnumMap; class: EnumMap; condition: EnumMap; listing_type: EnumMap;
  fuel_type: EnumMap; transmission: EnumMap; drivetrain: EnumMap; status: EnumMap; currency: EnumMap;
  lead_type: EnumMap; lead_status: EnumMap;
};

const enums: Record<DashLang, EnumGroups> = {
  en: {
    category: { sedan: 'Sedan', suv: 'SUV', coupe: 'Coupe', hatchback: 'Hatchback', convertible: 'Convertible', pickup: 'Pickup', electric: 'Electric', sports: 'Sports', wagon: 'Wagon', crossover: 'Crossover', van: 'Van', minivan: 'Minivan', truck: 'Truck', mpv: 'MPV', supercar: 'Supercar', roadster: 'Roadster' },
    class: { economy: 'Economy', standard: 'Standard', premium: 'Premium', luxury: 'Luxury', executive: 'Executive', performance: 'Performance', 'ultra-luxury': 'Ultra-luxury' },
    condition: { new: 'New', used: 'Used', certified: 'Certified' },
    listing_type: { rent: 'For Rent', sale: 'For Sale', both: 'Rent / Sale' },
    fuel_type: { petrol: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Electric', 'plug-in-hybrid': 'Plug-in Hybrid' },
    transmission: { automatic: 'Automatic', manual: 'Manual', cvt: 'CVT', 'dual-clutch': 'Dual-clutch', 'semi-automatic': 'Semi-automatic' },
    drivetrain: { FWD: 'FWD', RWD: 'RWD', AWD: 'AWD', '4WD': '4WD' },
    status: { available: 'Available', sold: 'Sold', reserved: 'Reserved' },
    currency: { USD: 'USD', EUR: 'EUR', AED: 'AED' },
    lead_type: { inquiry: 'Inquiry', booking: 'Booking', purchase: 'Purchase', availability: 'Availability', viewing: 'Viewing' },
    lead_status: { new: 'New', contacted: 'Contacted', closed: 'Closed' },
  },
  ar: {
    category: { sedan: 'سيدان', suv: 'دفع رباعي', coupe: 'كوبيه', hatchback: 'هاتشباك', convertible: 'كشف', pickup: 'بيك أب', electric: 'كهربائية', sports: 'رياضية', wagon: 'ستيشن', crossover: 'كروس أوفر', van: 'فان', minivan: 'ميني فان', truck: 'شاحنة', mpv: 'متعددة الاستخدامات', supercar: 'خارقة', roadster: 'رودستر' },
    class: { economy: 'اقتصادية', standard: 'قياسية', premium: 'مميزة', luxury: 'فاخرة', executive: 'تنفيذية', performance: 'عالية الأداء', 'ultra-luxury': 'فائقة الفخامة' },
    condition: { new: 'جديدة', used: 'مستعملة', certified: 'معتمدة' },
    listing_type: { rent: 'للإيجار', sale: 'للبيع', both: 'إيجار / بيع' },
    fuel_type: { petrol: 'بنزين', diesel: 'ديزل', hybrid: 'هايبرد', electric: 'كهربائية', 'plug-in-hybrid': 'هايبرد قابل للشحن' },
    transmission: { automatic: 'أوتوماتيك', manual: 'يدوي', cvt: 'ناقل متغير', 'dual-clutch': 'قابض مزدوج', 'semi-automatic': 'نصف أوتوماتيك' },
    drivetrain: { FWD: 'دفع أمامي', RWD: 'دفع خلفي', AWD: 'دفع كلي', '4WD': 'دفع رباعي' },
    status: { available: 'متاحة', sold: 'مُباعة', reserved: 'محجوزة' },
    currency: { USD: 'USD', EUR: 'EUR', AED: 'AED' },
    lead_type: { inquiry: 'استفسار', booking: 'حجز', purchase: 'شراء', availability: 'توفّر', viewing: 'معاينة' },
    lead_status: { new: 'جديد', contacted: 'تم التواصل', closed: 'مغلق' },
  },
};

const DICT = {
  en: {
    overview: 'Overview', inventory: 'Inventory', leads: 'Leads', site: 'Site', settings: 'Settings', signOut: 'Sign out', dashboard: 'Dashboard', langToggle: 'العربية',
    welcome: 'Welcome back', totalCars: 'Total vehicles', available: 'Available', hidden: 'Hidden', featured: 'Featured',
    newLeads: 'New leads', overviewLeadsHint: 'unhandled — review them in Leads.',
    overviewHint: 'Manage your inventory from the Inventory section.',
    ld: {
      title: 'Leads', subtitle: 'Incoming inquiries and bookings — track and follow up.',
      total: 'Total', new: 'New', handled: 'Handled', contacted: 'Contacted', closed: 'Closed',
      search: 'Search name, phone, email…', allTypes: 'All types', allStatuses: 'All statuses',
      colWho: 'Who', colContact: 'Contact', colVehicle: 'Vehicle', colType: 'Type', colDate: 'Received', colStatus: 'Status',
      noLeads: 'No leads yet', noLeadsHint: 'Inquiries and bookings from your storefront will appear here.',
      selected: 'selected', changeStatus: 'Set status', markNew: 'New', markContacted: 'Contacted', markClosed: 'Closed',
      leads: 'leads', general: 'General inquiry', noContact: 'No contact info', rentalWindow: 'Rental', via: 'via',
      detailsTitle: 'Lead details', sectionCustomer: 'Customer', sectionMeta: 'Details', sectionMessage: 'Message', sectionVehicle: 'Vehicle', sectionBooking: 'Booking',
      noMessage: 'No message provided.', viewCar: 'View in inventory', close: 'Close',
      waBtn: 'WhatsApp', callBtn: 'Call', emailBtn: 'Email',
      fSource: 'Source', fLocale: 'Language', fReceived: 'Received', pickup: 'Pickup location',
      langName: { ar: 'Arabic', en: 'English' } as Record<string, string>, waGreeting: 'Hello',
    },
    ov: {
      subtitle: 'A snapshot of your inventory and incoming leads.',
      inventoryHeading: 'Inventory', leadsHeading: 'Leads', recentHeading: 'Recent leads',
      newLeads: 'New', handled: 'Handled', totalLeads: 'Total leads',
      noRecent: 'No leads yet — they’ll show up here as they arrive.',
      anonLead: 'New lead', generalInquiry: 'General inquiry',
      plan: 'Plan',
      plans: { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' } as Record<string, string>,
      planHeading: 'Plan & usage', vehiclesUsed: 'Vehicles used', unlimited: 'Unlimited',
      nearLimitTitle: "You're near your vehicle limit",
      nearLimitText: 'Upgrade your plan to add more vehicles.',
      limitReachedTitle: "You've reached your vehicle limit",
      limitReachedText: 'Upgrade your plan to keep adding vehicles.',
      planIncludes: 'Your plan includes',
      featVehicles: 'Vehicles', featImages: 'Images / vehicle',
      featFinancing: 'Financing', featVip: 'VIP delivery', featHybrid: 'Sale + rental', featCustomDomain: 'Custom domain',
      expandableNote: 'Limits expandable on request',
    },
    si: {
      title: 'Site management', subtitle: 'Control which pages and buttons appear on your storefront.',
      secPages: 'Pages & buttons', pagesHint: 'Turn optional pages and lead buttons on or off.',
      aboutPage: 'About page', aboutHint: 'Show the “About us” page and its nav link.',
      leadAvailability: '“Check availability” button', leadAvailabilityHint: 'Show the availability capture button on cars.',
      leadViewing: '“Book a viewing” button', leadViewingHint: 'Show the viewing capture button on cars.',
      autoTitle: 'Automatic (depends on rental)', servicesPage: 'Services page', bookingFlow: 'Booking',
      autoOn: 'Shown', autoOff: 'Hidden',
    },
    ci: {
      heading: 'Section content', hint: 'Customize the text of these sections. Leave a field empty to use the default.',
      secWhy: '“Why choose us” section', secHow: '“How it works” section', secAbout: 'About page',
      secHero: 'Hero section', secFinancing: 'Financing banner', secFinalCta: 'Final call-to-action', secFaq: 'FAQ',
      langEn: 'English', langAr: 'العربية',
      fHeading: 'Heading', fDescription: 'Sub-heading', fItem: 'Item', fStep: 'Step',
      fItemTitle: 'Title', fItemText: 'Short text',
      fBody: 'Body', bodyHint: 'Separate paragraphs with a blank line.',
      defaultHint: 'Leave empty to use the default.',
      fBadge: 'Badge', fHeadline1: 'Headline line 1', fHeadline2: 'Headline line 2 (accent)', fSubheadline: 'Sub-headline',
      fTitle: 'Title', fDesc: 'Description', fButton: 'Button label',
      fQuestion: 'Question', fAnswer: 'Answer',
      faqRow: 'Question', faqAdd: 'Add question', faqRemove: 'Remove',
      faqMax: 'Maximum 15 questions reached.',
      faqEmpty: 'No custom questions yet — the storefront uses the default set.',
    },
    st: {
      title: 'Settings', subtitle: 'Your storefront identity, branding, and SEO.',
      save: 'Save changes', saving: 'Saving…', saved: 'Settings saved', saveFailed: 'Could not save',
      ownerOnly: 'Only the workspace owner can edit settings.',
      areaHome: 'Home page sections', areaHomeHint: 'Order, show or hide, and edit the content of your home page sections.',
      areaSubpages: 'Sub-pages', areaSubpagesHint: 'About page copy, optional pages, and lead buttons.',
      livePreview: 'Live preview — these colors theme your storefront',
      previewButton: 'Primary button', previewOutline: 'Outline', unsavedColor: 'Unsaved',
      urlHint: 'Paste an image URL (https). External hosts are allowed.',
      imageHint: 'JPG / PNG / WebP — compressed and uploaded automatically.',
      upload: { upload: 'Upload', replace: 'Replace', remove: 'Remove', uploading: 'Uploading…' },
      hoursPlaceholder: 'e.g. 9:00 AM – 9:00 PM',
      mapLocation: 'Location', mapSearch: 'Search for your address…',
      mapHint: 'Search, click the map, or drag the pin to set your location.',
      secIdentity: 'Identity & contact', secBranding: 'Branding', secSeo: 'SEO', secHours: 'Business hours', secSocial: 'Social links',
      secSections: 'Home sections', sectionsHint: 'Show, hide, and reorder the sections on your storefront home page.',
      sectionLocked: 'Always shown', moveUp: 'Move up', moveDown: 'Move down', sectionHidden: 'Hidden',
      sectionUnavailable: 'Not on your plan',
      sectionGatedFinancing: "Financing isn't enabled on your plan, so this section won't appear on your site.",
      sectionLabels: {
        hero: 'Hero', brandShowcase: 'Brand showcase', featuredCars: 'Featured cars', whyChooseUs: 'Why choose us',
        featuredSpotlight: 'Featured spotlight', financing: 'Financing banner', howItWorks: 'How it works', faq: 'FAQ', finalCta: 'Final call-to-action',
      } as Record<string, string>,
      f: {
        name: 'Business name (EN)', name_ar: 'Business name (AR)', phone: 'Phone', whatsapp: 'WhatsApp number', email: 'Email',
        address_en: 'Address (EN)', address_ar: 'Address (AR)',
        map_lat: 'Map latitude', map_lng: 'Map longitude',
        color_primary: 'Primary color', color_secondary: 'Secondary color', color_accent: 'Accent color',
        logo_url: 'Logo URL', favicon_url: 'Favicon URL', og_image_url: 'Social share image (OG) URL',
        seo_title_en: 'SEO title (EN)', seo_title_ar: 'SEO title (AR)', seo_desc_en: 'SEO description (EN)', seo_desc_ar: 'SEO description (AR)',
        weekdays: 'Weekdays', weekends: 'Weekends',
      },
    },
    inventoryTitle: 'Inventory', inventorySubtitle: 'Manage your vehicles — availability, status, and details.',
    addCar: 'Add vehicle', search: 'Search brand, model…', noCars: 'No vehicles yet', noCarsHint: 'Add your first vehicle to get started.',
    // table
    colVehicle: 'Vehicle', colListing: 'Listing', colStatus: 'Status', colPrice: 'Price', colFeatured: 'Featured', colVisible: 'Visible', colActions: 'Actions',
    allStatuses: 'All statuses', allTypes: 'All types', forSale: 'For Sale', forRent: 'For Rent',
    selected: 'selected', show: 'Show', hide: 'Hide', feature: 'Feature', unfeature: 'Unfeature', del: 'Delete', vehicles: 'vehicles',
    deleteOneTitle: 'Delete vehicle?', deleteManyTitle: 'Delete selected vehicles?', cannotUndo: 'This cannot be undone.', cancel: 'Cancel',
    // price edit
    editPrice: 'Edit price', salePrice: 'Sale price', rentalDaily: 'Daily rental', monthlyPrice: 'Monthly', oldPrice: 'Was (old price)', save: 'Save', noPriceForType: 'No editable price for this listing type.',
    adjustPrice: 'Adjust price', byAmount: 'By amount', byPercent: 'By percentage', increase: 'Increase', decrease: 'Decrease', value: 'Value', apply: 'Apply',
    willUpdate: 'This will update', applyHint: 'Sale prices adjust the sale total; rental prices adjust the daily rate. Cars without that price are skipped.',
    // form
    addVehicle: 'Add vehicle', editVehicle: 'Edit vehicle', saving: 'Saving…',
    secBasics: 'Basics', secClass: 'Classification', secVisibility: 'Visibility', secPricing: 'Pricing', secSpecs: 'Specs', secLocation: 'Location', secContent: 'Content',
    fixFields: 'Please fix the highlighted fields', vehicleAdded: 'Vehicle added', vehicleUpdated: 'Vehicle updated', required: 'Required',
    showOnStore: 'Show on storefront', showSoldHint: 'Shown with a SOLD/RESERVED badge and no booking CTA', negotiable: 'Price negotiable',
    f: {
      brand: 'Brand', model: 'Model', year: 'Year', trim: 'Trim', listing_type: 'Listing', condition: 'Condition', category: 'Category', class: 'Class', status: 'Status',
      currency: 'Currency', price_daily: 'Daily', price_monthly: 'Monthly', price_total: 'Total / Sale', security_deposit: 'Deposit',
      transmission: 'Transmission', fuel_type: 'Fuel', drivetrain: 'Drivetrain', seats: 'Seats', doors: 'Doors', mileage: 'Mileage', color: 'Color', engine: 'Engine', horsepower: 'Horsepower',
      city: 'City', country: 'Country', title_en: 'Title (EN)', title_ar: 'Title (AR)', short_en: 'Short desc (EN)', short_ar: 'Short desc (AR)',
    },
    cf: {
      secBasics: 'Basics', secClassification: 'Classification', secPromotion: 'Promotion & visibility', secSpecs: 'Specifications', secConsumption: 'Fuel consumption', secLocation: 'Location & delivery', secSale: 'Sale pricing & details', secRental: 'Rental pricing & terms', secFinancing: 'Financing', secOwnership: 'Ownership history', secHighlights: 'Highlights', secFeatures: 'Features', secContent: 'Description & content',
      chooseTitle: 'What are you listing?', chooseHint: 'Pick how this vehicle is offered.', typeSale: 'For Sale', typeRent: 'For Rent', typeBoth: 'Sale & Rent',
      addTitle: 'Add vehicle', editTitle: 'Edit vehicle', backToList: 'Back to inventory', createBtn: 'Add vehicle', saveBtn: 'Save changes', saving: 'Saving…', fixFields: 'Please fix the highlighted fields', tagHint: 'Type and press Enter', required: 'Required', createdToast: 'Vehicle added', updatedToast: 'Vehicle updated', limitReached: "You've reached your plan's limit",
      brand: 'Brand', model: 'Model', year: 'Year', trim: 'Trim', listing_type: 'Listing type', condition: 'Condition', category: 'Category', class: 'Class', status: 'Status',
      brandSel: { label: 'Brand', placeholder: 'Select a brand', search: 'Search brands…', add: 'Add', adding: 'Adding…', empty: 'No brands found' },
      currency: 'Currency', price_total: 'Sale price', price_old: 'Old price (was)', monthly_installment: 'Monthly installment', price_daily: 'Daily', price_weekly: 'Weekly', price_monthly: 'Monthly', price_hourly: 'Hourly', security_deposit: 'Security deposit', min_rental_days: 'Min rental days', mileage_limit: 'Mileage limit (km/day)', insurance: 'Insurance',
      transmission: 'Transmission', fuel_type: 'Fuel', drivetrain: 'Drivetrain', seats: 'Seats', doors: 'Doors', mileage: 'Mileage (km)', color: 'Exterior color', interior_color: 'Interior color', engine: 'Engine', cylinders: 'Cylinders', horsepower: 'Horsepower', torque: 'Torque (Nm)', top_speed: 'Top speed (km/h)', acceleration: 'Acceleration (0-100)', fuel_tank: 'Fuel tank (L)', electric_range: 'Electric range (km)', fuel_city: 'City (L/100)', fuel_highway: 'Highway (L/100)', fuel_combined: 'Combined (L/100)', fuel_per20: 'Range per 20 L (km)',
      city: 'City', country: 'Country', address: 'Address', pickup_locations: 'Pickup locations', owners_count: 'Previous owners',
      title: 'Title', short_description: 'Short description', description: 'Full description', warranty: 'Warranty',
      features: 'Features', comfort: 'Comfort features', safety: 'Safety features', entertainment: 'Entertainment', requirements: 'Requirements', included_services: 'Included services', ideal_for: 'Ideal for', pros: 'Pros', cons: 'Considerations',
      available: 'Show on storefront', availableHint: 'Visible to the public', showSoldHint: 'Shown with a SOLD/RESERVED badge and no booking CTA',
      featured: 'Featured', featuredHint: 'Highlight in featured sections', hero: 'Hero spotlight', heroHint: 'Show in the homepage hero', popular: 'Popular', newArrival: 'New arrival', bestSeller: 'Best seller',
      negotiable: 'Price negotiable', financing: 'Financing available', delivery: 'Delivery available', accidentFree: 'Accident-free', serviceHistory: 'Full service history',
      is_financeable: 'Offered with financing', is_financeableHint: 'Show this car as financeable', down_payment: 'Down payment',
      imgTitle: 'Images', imgHint: 'JPG / PNG / WebP — compressed to WebP before upload', imgAdd: 'Add images', imgUploading: 'Uploading…', imgPrimary: 'Primary', imgSetPrimary: 'Set as primary', imgLimit: 'Image limit reached', imgInvalidType: 'Unsupported file type', imgTooLarge: 'File too large (max 15MB)', imgCompressed: 'Compressed',
      tabEn: 'English', tabAr: 'العربية',
      ph: {
        brand: 'Toyota', model: 'Camry', year: '2022', trim: 'GLX',
        price_total: '25000', price_old: '28000', monthly_installment: '450',
        price_daily: '50', price_weekly: '300', price_monthly: '1000', price_hourly: '10', security_deposit: '500', min_rental_days: '2', mileage_limit: '250', insurance: 'Comprehensive', down_payment: '5000',
        seats: '5', doors: '4', mileage: '45000', color: 'White', interior_color: 'Black', engine: '2.0L Turbo', cylinders: '4', horsepower: '200', torque: '350', top_speed: '240', acceleration: '0-100 in 7.2s', fuel_tank: '60', electric_range: '450', fuel_city: '9.5', fuel_highway: '6.5', fuel_combined: '8.0', fuel_per20: '280',
        city: 'Damascus', country: 'Syria', address: 'Mezzeh, Damascus', owners_count: '1',
        title: 'Toyota Camry 2022', short_description: 'Well-maintained, low mileage, single owner', description: 'Full vehicle description…', warranty: '2 years',
      },
    },
  },
  ar: {
    overview: 'نظرة عامة', inventory: 'المخزون', leads: 'الطلبات', site: 'الموقع', settings: 'الإعدادات', signOut: 'تسجيل الخروج', dashboard: 'لوحة التحكم', langToggle: 'English',
    welcome: 'مرحباً بعودتك', totalCars: 'إجمالي المركبات', available: 'متاحة', hidden: 'مخفية', featured: 'مميّزة',
    newLeads: 'طلبات جديدة', overviewLeadsHint: 'بانتظار المتابعة — راجعها في قسم الطلبات.',
    overviewHint: 'أدر مخزونك من قسم المخزون.',
    ld: {
      title: 'الطلبات الواردة', subtitle: 'الاستفسارات والحجوزات الواردة — تابعها وحدّث حالتها.',
      total: 'الإجمالي', new: 'جديد', handled: 'تمت المعالجة', contacted: 'تم التواصل', closed: 'مغلق',
      search: 'ابحث بالاسم أو الهاتف أو البريد…', allTypes: 'كل الأنواع', allStatuses: 'كل الحالات',
      colWho: 'العميل', colContact: 'التواصل', colVehicle: 'المركبة', colType: 'النوع', colDate: 'وردت', colStatus: 'الحالة',
      noLeads: 'لا توجد طلبات بعد', noLeadsHint: 'ستظهر هنا الاستفسارات والحجوزات الواردة من متجرك.',
      selected: 'محدد', changeStatus: 'تعيين الحالة', markNew: 'جديد', markContacted: 'تم التواصل', markClosed: 'مغلق',
      leads: 'طلب', general: 'استفسار عام', noContact: 'لا توجد بيانات تواصل', rentalWindow: 'الإيجار', via: 'عبر',
      detailsTitle: 'تفاصيل الطلب', sectionCustomer: 'العميل', sectionMeta: 'التفاصيل', sectionMessage: 'الرسالة', sectionVehicle: 'المركبة', sectionBooking: 'الحجز',
      noMessage: 'لا توجد رسالة.', viewCar: 'عرض في المخزون', close: 'إغلاق',
      waBtn: 'واتساب', callBtn: 'اتصال', emailBtn: 'بريد',
      fSource: 'المصدر', fLocale: 'اللغة', fReceived: 'وردت', pickup: 'موقع الاستلام',
      langName: { ar: 'العربية', en: 'الإنجليزية' } as Record<string, string>, waGreeting: 'مرحباً',
    },
    ov: {
      subtitle: 'لمحة سريعة عن مخزونك والطلبات الواردة.',
      inventoryHeading: 'المخزون', leadsHeading: 'الطلبات', recentHeading: 'أحدث الطلبات',
      newLeads: 'جديدة', handled: 'تمت المعالجة', totalLeads: 'إجمالي الطلبات',
      noRecent: 'لا توجد طلبات بعد — ستظهر هنا فور ورودها.',
      anonLead: 'طلب جديد', generalInquiry: 'استفسار عام',
      plan: 'الباقة',
      plans: { starter: 'المبتدئة', pro: 'الاحترافية', enterprise: 'المؤسسية' } as Record<string, string>,
      planHeading: 'الباقة والاستخدام', vehiclesUsed: 'المركبات المستخدمة', unlimited: 'غير محدود',
      nearLimitTitle: 'اقتربت من حدّ عدد المركبات',
      nearLimitText: 'قم بترقية باقتك لإضافة المزيد من المركبات.',
      limitReachedTitle: 'وصلت إلى حدّ عدد المركبات',
      limitReachedText: 'قم بترقية باقتك لمواصلة إضافة المركبات.',
      planIncludes: 'تتضمن باقتك',
      featVehicles: 'المركبات', featImages: 'الصور / مركبة',
      featFinancing: 'التقسيط', featVip: 'توصيل VIP', featHybrid: 'بيع وإيجار', featCustomDomain: 'نطاق مخصص',
      expandableNote: 'الحدود قابلة للتوسيع عند الطلب',
    },
    si: {
      title: 'إدارة الموقع', subtitle: 'تحكّم في الصفحات والأزرار التي تظهر في متجرك.',
      secPages: 'الصفحات والأزرار', pagesHint: 'فعّل أو عطّل الصفحات الاختيارية وأزرار الطلب.',
      aboutPage: 'صفحة من نحن', aboutHint: 'إظهار صفحة «من نحن» ورابطها في القائمة.',
      leadAvailability: 'زر «تأكّد من التوفّر»', leadAvailabilityHint: 'إظهار زر طلب التوفّر على السيارات.',
      leadViewing: 'زر «احجز معاينة»', leadViewingHint: 'إظهار زر طلب المعاينة على السيارات.',
      autoTitle: 'تلقائي (حسب التأجير)', servicesPage: 'صفحة الخدمات', bookingFlow: 'الحجز',
      autoOn: 'ظاهر', autoOff: 'مخفي',
    },
    ci: {
      heading: 'محتوى الأقسام', hint: 'خصّص نصوص هذه الأقسام. اترك الحقل فارغاً لاستخدام النص الافتراضي.',
      secWhy: 'قسم «لماذا نحن»', secHow: 'قسم «كيف يعمل»', secAbout: 'صفحة من نحن',
      secHero: 'قسم الواجهة', secFinancing: 'لافتة التقسيط', secFinalCta: 'دعوة لاتخاذ إجراء', secFaq: 'الأسئلة الشائعة',
      langEn: 'English', langAr: 'العربية',
      fHeading: 'العنوان', fDescription: 'العنوان الفرعي', fItem: 'عنصر', fStep: 'خطوة',
      fItemTitle: 'العنوان', fItemText: 'نص مختصر',
      fBody: 'النص', bodyHint: 'افصل بين الفقرات بسطر فارغ.',
      defaultHint: 'اترك الحقل فارغاً لاستخدام النص الافتراضي.',
      fBadge: 'الشارة', fHeadline1: 'العنوان الرئيسي (سطر 1)', fHeadline2: 'العنوان الرئيسي (سطر 2 — لون مميّز)', fSubheadline: 'العنوان الفرعي',
      fTitle: 'العنوان', fDesc: 'الوصف', fButton: 'نص الزر',
      fQuestion: 'السؤال', fAnswer: 'الإجابة',
      faqRow: 'سؤال', faqAdd: 'إضافة سؤال', faqRemove: 'حذف',
      faqMax: 'تم بلوغ الحد الأقصى (15 سؤالاً).',
      faqEmpty: 'لا توجد أسئلة مخصّصة بعد — يستخدم المتجر المجموعة الافتراضية.',
    },
    st: {
      title: 'الإعدادات', subtitle: 'هوية متجرك وهويته البصرية وتحسين محركات البحث.',
      save: 'حفظ التغييرات', saving: 'جارٍ الحفظ…', saved: 'تم حفظ الإعدادات', saveFailed: 'تعذّر الحفظ',
      ownerOnly: 'يمكن لمالك الحساب فقط تعديل الإعدادات.',
      areaHome: 'أقسام الصفحة الرئيسية', areaHomeHint: 'رتّب أقسام صفحتك الرئيسية وأظهرها أو أخفِها وعدّل محتواها.',
      areaSubpages: 'الصفحات الفرعية', areaSubpagesHint: 'نصوص صفحة «من نحن»، والصفحات الاختيارية، وأزرار الطلب.',
      livePreview: 'معاينة حية — هذه الألوان تُطبّق على متجرك',
      previewButton: 'زر رئيسي', previewOutline: 'محدّد', unsavedColor: 'غير محفوظ',
      urlHint: 'ألصق رابط صورة (https). الروابط الخارجية مسموحة.',
      imageHint: 'JPG / PNG / WebP — تُضغط وتُرفع تلقائياً.',
      upload: { upload: 'رفع', replace: 'استبدال', remove: 'إزالة', uploading: 'جارٍ الرفع…' },
      hoursPlaceholder: 'مثال: 9:00 ص – 9:00 م',
      mapLocation: 'الموقع', mapSearch: 'ابحث عن عنوانك…',
      mapHint: 'ابحث أو انقر على الخريطة أو اسحب المؤشر لتحديد موقعك.',
      secIdentity: 'الهوية والتواصل', secBranding: 'الهوية البصرية', secSeo: 'تحسين محركات البحث', secHours: 'ساعات العمل', secSocial: 'روابط التواصل',
      secSections: 'أقسام الصفحة الرئيسية', sectionsHint: 'أظهر أو أخفِ أقسام صفحتك الرئيسية وأعد ترتيبها.',
      sectionLocked: 'ظاهر دائماً', moveUp: 'تحريك لأعلى', moveDown: 'تحريك لأسفل', sectionHidden: 'مخفي',
      sectionUnavailable: 'غير متاح في باقتك',
      sectionGatedFinancing: 'التقسيط غير مُفعّل في باقتك، لذلك لن يظهر هذا القسم في موقعك.',
      sectionLabels: {
        hero: 'الواجهة', brandShowcase: 'الماركات', featuredCars: 'سيارات مميزة', whyChooseUs: 'لماذا نحن',
        featuredSpotlight: 'السيارة المميزة', financing: 'لافتة التقسيط', howItWorks: 'كيف يعمل', faq: 'الأسئلة الشائعة', finalCta: 'دعوة لاتخاذ إجراء',
      } as Record<string, string>,
      f: {
        name: 'اسم النشاط (إنجليزي)', name_ar: 'اسم النشاط (عربي)', phone: 'الهاتف', whatsapp: 'رقم واتساب', email: 'البريد الإلكتروني',
        address_en: 'العنوان (إنجليزي)', address_ar: 'العنوان (عربي)',
        map_lat: 'خط العرض', map_lng: 'خط الطول',
        color_primary: 'اللون الأساسي', color_secondary: 'اللون الثانوي', color_accent: 'لون التمييز',
        logo_url: 'رابط الشعار', favicon_url: 'رابط الأيقونة', og_image_url: 'رابط صورة المشاركة (OG)',
        seo_title_en: 'عنوان SEO (إنجليزي)', seo_title_ar: 'عنوان SEO (عربي)', seo_desc_en: 'وصف SEO (إنجليزي)', seo_desc_ar: 'وصف SEO (عربي)',
        weekdays: 'أيام الأسبوع', weekends: 'نهاية الأسبوع',
      },
    },
    inventoryTitle: 'المخزون', inventorySubtitle: 'أدر مركباتك — التوفر والحالة والتفاصيل.',
    addCar: 'إضافة مركبة', search: 'ابحث بالماركة أو الموديل…', noCars: 'لا توجد مركبات بعد', noCarsHint: 'أضف أول مركبة للبدء.',
    colVehicle: 'المركبة', colListing: 'العرض', colStatus: 'الحالة', colPrice: 'السعر', colFeatured: 'مميّزة', colVisible: 'ظاهرة', colActions: 'إجراءات',
    allStatuses: 'كل الحالات', allTypes: 'كل الأنواع', forSale: 'للبيع', forRent: 'للإيجار',
    selected: 'محدد', show: 'إظهار', hide: 'إخفاء', feature: 'تمييز', unfeature: 'إلغاء التمييز', del: 'حذف', vehicles: 'مركبة',
    deleteOneTitle: 'حذف المركبة؟', deleteManyTitle: 'حذف المركبات المحددة؟', cannotUndo: 'لا يمكن التراجع عن هذا.', cancel: 'إلغاء',
    editPrice: 'تعديل السعر', salePrice: 'سعر البيع', rentalDaily: 'الإيجار اليومي', monthlyPrice: 'الشهري', oldPrice: 'السعر السابق', save: 'حفظ', noPriceForType: 'لا يوجد سعر قابل للتعديل لهذا النوع.',
    adjustPrice: 'تعديل الأسعار', byAmount: 'بمبلغ ثابت', byPercent: 'بنسبة مئوية', increase: 'زيادة', decrease: 'خفض', value: 'القيمة', apply: 'تطبيق',
    willUpdate: 'سيتم تحديث', applyHint: 'أسعار البيع تعدّل سعر البيع الكلي؛ أسعار الإيجار تعدّل السعر اليومي. تُتجاهل المركبات بدون هذا السعر.',
    addVehicle: 'إضافة مركبة', editVehicle: 'تعديل المركبة', saving: 'جارٍ الحفظ…',
    secBasics: 'الأساسيات', secClass: 'التصنيف', secVisibility: 'الظهور', secPricing: 'التسعير', secSpecs: 'المواصفات', secLocation: 'الموقع', secContent: 'المحتوى (عربي / إنجليزي)',
    fixFields: 'يرجى تصحيح الحقول المميزة', vehicleAdded: 'تمت إضافة المركبة', vehicleUpdated: 'تم تحديث المركبة', required: 'مطلوب',
    showOnStore: 'إظهار على المتجر', showSoldHint: 'ستظهر مع شارة "مُباعة/محجوزة" وبدون زر الحجز', negotiable: 'قابل للتفاوض',
    f: {
      brand: 'الماركة', model: 'الموديل', year: 'السنة', trim: 'الفئة', listing_type: 'العرض', condition: 'الحالة', category: 'النوع', class: 'الفئة', status: 'الحالة',
      currency: 'العملة', price_daily: 'يومي', price_monthly: 'شهري', price_total: 'الكلي / البيع', security_deposit: 'التأمين',
      transmission: 'ناقل الحركة', fuel_type: 'الوقود', drivetrain: 'الدفع', seats: 'المقاعد', doors: 'الأبواب', mileage: 'المسافة', color: 'اللون', engine: 'المحرك', horsepower: 'القوة',
      city: 'المدينة', country: 'الدولة', title_en: 'العنوان (EN)', title_ar: 'العنوان (AR)', short_en: 'وصف مختصر (EN)', short_ar: 'وصف مختصر (AR)',
    },
    cf: {
      secBasics: 'الأساسيات', secClassification: 'التصنيف', secPromotion: 'الترويج والظهور', secSpecs: 'المواصفات', secConsumption: 'استهلاك الوقود', secLocation: 'الموقع والتوصيل', secSale: 'تفاصيل وأسعار البيع', secRental: 'أسعار وشروط الإيجار', secFinancing: 'التمويل', secOwnership: 'سجل الملكية', secHighlights: 'أبرز النقاط', secFeatures: 'المزايا', secContent: 'الوصف والمحتوى',
      chooseTitle: 'ما نوع العرض؟', chooseHint: 'اختر طريقة عرض هذه المركبة.', typeSale: 'للبيع', typeRent: 'للإيجار', typeBoth: 'بيع وإيجار',
      addTitle: 'إضافة مركبة', editTitle: 'تعديل المركبة', backToList: 'العودة للمخزون', createBtn: 'إضافة مركبة', saveBtn: 'حفظ التغييرات', saving: 'جارٍ الحفظ…', fixFields: 'يرجى تصحيح الحقول المميزة', tagHint: 'اكتب ثم اضغط Enter', required: 'مطلوب', createdToast: 'تمت إضافة المركبة', updatedToast: 'تم تحديث المركبة', limitReached: 'لقد وصلت إلى حد باقتك',
      brand: 'الماركة', model: 'الموديل', year: 'السنة', trim: 'الطراز', listing_type: 'نوع العرض', condition: 'الحالة', category: 'النوع', class: 'الفئة', status: 'حالة العرض',
      brandSel: { label: 'الماركة', placeholder: 'اختر ماركة', search: 'ابحث عن ماركة…', add: 'إضافة', adding: 'جارٍ الإضافة…', empty: 'لا توجد ماركات' },
      currency: 'العملة', price_total: 'سعر البيع', price_old: 'السعر السابق', monthly_installment: 'قسط التقسيط', price_daily: 'يومي', price_weekly: 'أسبوعي', price_monthly: 'القسط الشهري', price_hourly: 'بالساعة', security_deposit: 'مبلغ التأمين', min_rental_days: 'أقل عدد أيام', mileage_limit: 'حد المسافة (كم/يوم)', insurance: 'التأمين',
      transmission: 'ناقل الحركة', fuel_type: 'الوقود', drivetrain: 'الدفع', seats: 'المقاعد', doors: 'الأبواب', mileage: 'المسافة (كم)', color: 'اللون الخارجي', interior_color: 'اللون الداخلي', engine: 'المحرك', cylinders: 'الأسطوانات', horsepower: 'القوة', torque: 'العزم', top_speed: 'السرعة القصوى', acceleration: 'التسارع (0-100)', fuel_tank: 'خزان الوقود (لتر)', electric_range: 'المدى الكهربائي (كم)', fuel_city: 'المدينة (لتر/100)', fuel_highway: 'الطريق (لتر/100)', fuel_combined: 'مشترك (لتر/100)', fuel_per20: 'المدى لكل 20 لتر (كم)',
      city: 'المدينة', country: 'الدولة', address: 'العنوان', pickup_locations: 'مواقع الاستلام', owners_count: 'الملاك السابقون',
      title: 'العنوان', short_description: 'وصف مختصر', description: 'الوصف الكامل', warranty: 'الضمان',
      features: 'المزايا', comfort: 'مزايا الراحة', safety: 'مزايا الأمان', entertainment: 'الترفيه', requirements: 'المتطلبات', included_services: 'الخدمات المشمولة', ideal_for: 'مثالية لـ', pros: 'الإيجابيات', cons: 'اعتبارات',
      available: 'إظهار على المتجر', availableHint: 'ظاهرة للعامة', showSoldHint: 'تظهر مع شارة "مُباعة/محجوزة" وبدون زر الحجز',
      featured: 'مميّزة', featuredHint: 'إبراز في الأقسام المميزة', hero: 'العرض الرئيسي', heroHint: 'الظهور في الواجهة الرئيسية', popular: 'شائعة', newArrival: 'وصلت حديثاً', bestSeller: 'الأكثر مبيعاً',
      negotiable: 'قابل للتفاوض', financing: 'تمويل متاح', delivery: 'توصيل متاح', accidentFree: 'خالية من الحوادث', serviceHistory: 'سجل صيانة كامل',
      is_financeable: 'متاح بالتمويل', is_financeableHint: 'إظهار هذه السيارة كقابلة للتمويل', down_payment: 'الدفعة الأولى',
      imgTitle: 'الصور', imgHint: 'JPG / PNG / WebP — تُضغط إلى WebP قبل الرفع', imgAdd: 'إضافة صور', imgUploading: 'جارٍ الرفع…', imgPrimary: 'رئيسية', imgSetPrimary: 'تعيين كرئيسية', imgLimit: 'تم بلوغ حد الصور', imgInvalidType: 'نوع ملف غير مدعوم', imgTooLarge: 'الملف كبير جداً (الحد 15MB)', imgCompressed: 'تم الضغط',
      tabEn: 'English', tabAr: 'العربية',
      ph: {
        brand: 'Toyota', model: 'Camry', year: '2022', trim: 'GLX',
        price_total: '25000', price_old: '28000', monthly_installment: '450',
        price_daily: '50', price_weekly: '300', price_monthly: '1000', price_hourly: '10', security_deposit: '500', min_rental_days: '2', mileage_limit: '250', insurance: 'تأمين شامل', down_payment: '5000',
        seats: '5', doors: '4', mileage: '45000', color: 'أبيض', interior_color: 'أسود', engine: '2.0 لتر تيربو', cylinders: '4', horsepower: '200', torque: '350', top_speed: '240', acceleration: '0-100 في 7.2 ث', fuel_tank: '60', electric_range: '450', fuel_city: '9.5', fuel_highway: '6.5', fuel_combined: '8.0', fuel_per20: '280',
        city: 'دمشق', country: 'سوريا', address: 'المزة، دمشق', owners_count: '1',
        title: 'تويوتا كامري 2022', short_description: 'بحالة ممتازة، مسافة قليلة، مالك واحد', description: 'وصف كامل للمركبة…', warranty: 'سنتان',
      },
    },
  },
};

export type DashDict = (typeof DICT)['en'];

type Ctx = {
  lang: DashLang;
  dir: 'rtl' | 'ltr';
  t: DashDict;
  toggle: () => void;
  el: (group: keyof EnumGroups, value: string) => string;
};
const DashI18nContext = createContext<Ctx | null>(null);

export function DashI18nProvider({ initialLang = 'en', children }: { initialLang?: DashLang; children: React.ReactNode }) {
  const [lang, setLang] = useState<DashLang>(initialLang);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      document.cookie = `caros_dash_lang=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const el = (group: keyof EnumGroups, v: string) => enums[lang][group]?.[v] ?? v;
    return { lang, dir, t: DICT[lang], toggle, el };
  }, [lang, toggle]);

  return <DashI18nContext.Provider value={value}>{children}</DashI18nContext.Provider>;
}

export function useDash() {
  const ctx = useContext(DashI18nContext);
  if (!ctx) throw new Error('useDash must be used within DashI18nProvider');
  return ctx;
}
