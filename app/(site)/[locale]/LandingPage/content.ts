export type LandingLocale = 'en' | 'ar';

type HeroContent = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  proofPoints: string[];
};

type SplitSection = {
  eyebrow?: string;
  title: string;
  description: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightDescription: string;
};

type CardItem = {
  title: string;
  description: string;
};

type ProductShowcase = {
  title: string;
  description: string;
  items: CardItem[];
};

type VisualPreview = {
  title: string;
  description: string;
  items: CardItem[];
  demoNote: string;
};

type Benefits = {
  title: string;
  items: CardItem[];
};

type ServiceOffering = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  cardTitle: string;
  cardDescription: string;
  primaryCta: string;
  secondaryCta: string;
};

type PricingPlan = {
  name: string;
  price: string;
  audience: string;
  includes: string[];
  cta: string;
};

type Pricing = {
  title: string;
  description: string;
  product: PricingPlan;
  service: PricingPlan;
  footerCta: string;
};

type UseCases = {
  title: string;
  items: CardItem[];
};

type WhyCaros = {
  title: string;
  description: string;
  items: string[];
  cta: string;
};

type FinalCta = {
  title: string;
  description: string;
  urgency: string;
  primaryCta: string;
  secondaryCta: string;
};

export type LandingContent = {
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  hero: HeroContent;
  problemSolution: SplitSection;
  productShowcase: ProductShowcase;
  visualPreview: VisualPreview;
  benefits: Benefits;
  serviceOffering: ServiceOffering;
  pricing: Pricing;
  useCases: UseCases;
  whyCaros: WhyCaros;
  finalCta: FinalCta;
};

export const landingContent: Record<
  LandingLocale,
  LandingContent
> = {
  en: {
    seo: {
      title: 'Caros Landing Page',
      description:
        'Discover Caros, a premium multilingual automotive platform sold as both a ready-to-use product and a custom implementation service.',
      ogTitle:
        'Caros | Premium Automotive Platform for Fast Launches',
      ogDescription:
        'Launch a premium automotive website faster with multilingual inventory, search, lead flows, and custom implementation options.',
    },
    hero: {
      eyebrow: 'Premium Automotive Platform',
      title:
        'Launch your automotive brand with a premium website',
      highlight: 'already built to convert',
      description:
        'Caros gives rental companies, dealerships, luxury transport brands, and agencies a faster way to launch a polished multilingual platform for inventory, search, and lead capture.',
      primaryCta: 'Get Started',
      secondaryCta: 'View Demo',
      proofPoints: [
        'English + Arabic ready',
        'Rental + sale inventory support',
        'Built-in WhatsApp lead flow',
      ],
    },
    problemSolution: {
      eyebrow: 'Why teams choose Caros',
      title:
        'Building from scratch is slow. Shipping something premium is even harder.',
      description:
        'Most automotive businesses lose time across design, inventory structure, localization, search, and lead capture before they ever launch.',
      leftTitle: 'What usually goes wrong',
      leftItems: [
        'Custom builds take too long to reach market.',
        'Generic templates look cheap and convert poorly.',
        'Bilingual automotive experiences are harder than they appear.',
        'Search, filtering, and vehicle presentation need real product thinking.',
        'Many sites look acceptable but fail to generate qualified inquiries.',
      ],
      rightTitle: 'What Caros changes',
      rightDescription:
        'Instead of assembling everything from zero, you start with a polished automotive system already structured for listings, vehicle pages, multilingual content, and direct lead conversion.',
    },
    productShowcase: {
      title:
        'A complete automotive frontend system, not just a pretty shell',
      description:
        'Caros combines marketing pages, inventory browsing, vehicle detail flows, localization, and inquiry paths in one cohesive platform.',
      items: [
        {
          title: 'Multilingual foundation',
          description:
            'Built for English and Arabic with locale routing and structured translation layers.',
        },
        {
          title: 'Inventory experience',
          description:
            'Supports rental, sale, or mixed inventory with rich specs, image galleries, and merchandising.',
        },
        {
          title: 'Search and filtering',
          description:
            'Helps visitors find the right vehicle faster through search, filters, sorting, and paginated listings.',
        },
        {
          title: 'Conversion paths',
          description:
            'Moves users from browsing to inquiry through WhatsApp, booking, contact, and strong car-detail CTAs.',
        },
      ],
    },
    visualPreview: {
      title:
        'Show the product where buyers feel the value instantly',
      description:
        'The interface should be demonstrated through real product screens, not abstract illustrations.',
      items: [
        {
          title: 'Homepage',
          description:
            'Show the premium hero, quick search panel, and featured inventory blocks.',
        },
        {
          title: 'Listings',
          description:
            'Show filters, sorting, inventory cards, and the browsing experience on desktop.',
        },
        {
          title: 'Vehicle detail',
          description:
            'Show the gallery, pricing, specs, and conversion-focused inquiry area.',
        },
        {
          title: 'Mobile view',
          description:
            'Show how the experience feels on phones for discovery and contact.',
        },
      ],
      demoNote:
        'A short scroll-based demo can show the full flow from homepage to listing to vehicle detail to contact.',
    },
    benefits: {
      title:
        'The business outcomes matter more than the build process',
      items: [
        {
          title: 'Launch in a fraction of the time',
          description:
            'Skip the long setup phase and start from a product already shaped for automotive use.',
        },
        {
          title: 'Lower the cost of going premium',
          description:
            'Get a high-end interface and conversion-ready structure without funding a full build from zero.',
        },
        {
          title: 'Capture more qualified leads',
          description:
            'Turn browsing into action with stronger car pages, inquiry flows, and direct messaging paths.',
        },
        {
          title: 'Look credible from day one',
          description:
            'Present your business with the polish customers expect from a serious automotive brand.',
        },
      ],
    },
    serviceOffering: {
      eyebrow: 'Custom Implementation',
      title:
        'Need more than a starter? We turn Caros into your platform.',
      description:
        'For companies and agencies that want speed without compromise, we customize Caros around your brand, business model, and launch requirements.',
      bullets: [
        'Branding and visual adaptation',
        'Page structure and content tailoring',
        'English and Arabic setup refinement',
        'Rental, dealership, or hybrid positioning',
        'Launch support and deployment assistance',
        'Ongoing improvements through retained service or project delivery',
      ],
      cardTitle: 'From premium starter to tailored delivery',
      cardDescription:
        'Use Caros as your foundation, then let us adapt the experience to your business so you launch with something that feels custom-built.',
      primaryCta: 'Book a Consultation',
      secondaryCta: 'Request Custom Setup',
    },
    pricing: {
      title:
        'Choose the model that fits how you want to launch',
      description:
        'Buy the product and move internally, or work with us for a tailored delivery.',
      product: {
        name: 'Product License',
        price: 'One-time purchase',
        audience:
          'For teams who want the platform now and can handle rollout internally.',
        includes: [
          'Core Caros codebase',
          'Premium marketing and inventory pages',
          'English + Arabic structure',
          'Search, filters, and vehicle detail flows',
          'Setup guidance',
        ],
        cta: 'Buy Caros',
      },
      service: {
        name: 'Custom Service',
        price: 'Monthly retainer or custom project scope',
        audience:
          'For brands that want a faster launch with expert adaptation, deployment, and continued support.',
        includes: [
          'Product setup and customization',
          'Brand and content adaptation',
          'Launch support',
          'Ongoing updates available',
        ],
        cta: 'Request Pricing',
      },
      footerCta: 'Talk to Sales',
    },
    useCases: {
      title:
        'Built for the businesses driving automotive demand',
      items: [
        {
          title: 'Car rental companies',
          description:
            'Launch a modern fleet website with stronger inquiry paths.',
        },
        {
          title: 'Dealerships',
          description:
            'Present inventory with more trust, clarity, and premium appeal.',
        },
        {
          title: 'Agencies',
          description:
            'Start from a serious base and deliver faster for client projects.',
        },
        {
          title: 'Mobility startups',
          description:
            'Validate and launch with a professional frontend before building deeper systems.',
        },
      ],
    },
    whyCaros: {
      title: 'Why Caros stands apart',
      description:
        'It is not positioned like a generic theme because it is already structured like a real automotive product.',
      items: [
        'Production-shaped page architecture',
        'Real bilingual setup, not translation as an afterthought',
        'Built around inventory browsing and lead conversion',
        'Localized vehicle pages with SEO intent',
        'Modular enough for product sales and custom service delivery',
        'Premium presentation without needing a full redesign first',
      ],
      cta: 'Compare Your Current Setup',
    },
    finalCta: {
      title:
        'Launch sooner. Look premium immediately. Start with a platform built for your market.',
      description:
        'If you need a faster way to launch an automotive website that feels credible, modern, and conversion-ready, Caros gives you the foundation and the option for full custom delivery.',
      urgency:
        'The longer you delay launch, the longer your market is landing on something weaker.',
      primaryCta: 'Get Started',
      secondaryCta: 'Book a Demo',
    },
  },
  ar: {
    seo: {
      title: 'صفحة Caros التعريفية',
      description:
        'اكتشف Caros، منصة سيارات احترافية متعددة اللغات تُقدَّم كمنتج جاهز وكخدمة تنفيذ مخصصة.',
      ogTitle:
        'Caros | منصة سيارات احترافية لإطلاق أسرع',
      ogDescription:
        'أطلق موقع سيارات فاخر بشكل أسرع مع مخزون متعدد اللغات، بحث وفلاتر، وتدفقات تواصل جاهزة.',
    },
    hero: {
      eyebrow: 'منصة سيارات احترافية',
      title:
        'أطلق علامتك في قطاع السيارات بموقع فاخر',
      highlight: 'جاهز للبيع والتحويل',
      description:
        'Caros يمنح شركات التأجير والمعارض والعلامات الفاخرة والوكالات طريقة أسرع لإطلاق منصة متعددة اللغات، مصممة لعرض المخزون وجذب العملاء وتحويل الزيارات إلى استفسارات مباشرة.',
      primaryCta: 'ابدأ الآن',
      secondaryCta: 'شاهد العرض',
      proofPoints: [
        'جاهز للعربية والإنجليزية',
        'يدعم التأجير والبيع',
        'تدفق واتساب مدمج',
      ],
    },
    problemSolution: {
      eyebrow: 'لماذا تختار الشركات Caros',
      title:
        'بناء منصة سيارات من الصفر بطيء. والوصول إلى تجربة فاخرة أصعب.',
      description:
        'معظم الشركات تضيع الوقت بين التصميم، هيكلة المخزون، الترجمة، البحث، وتجميع وسائل التواصل قبل أن تطلق الموقع أصلًا.',
      leftTitle: 'أين تكمن المشكلة عادةً',
      leftItems: [
        'التطوير المخصص يستغرق وقتًا طويلًا قبل الوصول للسوق.',
        'القوالب العامة تبدو رخيصة ولا تحقق نتائج تجارية قوية.',
        'المواقع الثنائية اللغة في قطاع السيارات أكثر تعقيدًا مما يبدو.',
        'البحث والفلاتر وصفحات السيارات تحتاج تفكيرًا منتجيًا حقيقيًا.',
        'كثير من المواقع مقبولة بصريًا لكنها ضعيفة في توليد العملاء الجادين.',
      ],
      rightTitle: 'ما الذي يغيره Caros',
      rightDescription:
        'بدل أن تبني كل شيء من البداية، تبدأ بمنصة سيارات مصممة أصلًا للعرض، وصفحات التفاصيل، والمحتوى المتعدد اللغات، وتحويل الزائر إلى استفسار مباشر.',
    },
    productShowcase: {
      title:
        'منظومة واجهة متكاملة لقطاع السيارات، وليست مجرد واجهة جميلة',
      description:
        'Caros يجمع بين الصفحات التسويقية، عرض المخزون، صفحات السيارات، الترجمة، ومسارات الاستفسار في تجربة واحدة مترابطة.',
      items: [
        {
          title: 'أساس متعدد اللغات',
          description:
            'مبني للعربية والإنجليزية مع مسارات لغة واضحة وطبقات ترجمة منظمة.',
        },
        {
          title: 'تجربة عرض المخزون',
          description:
            'يدعم التأجير والبيع أو النموذج المختلط مع مواصفات وصور ومعارض وعرض تسويقي احترافي.',
        },
        {
          title: 'البحث والفلاتر',
          description:
            'يساعد الزائر على الوصول بسرعة للسيارة المناسبة عبر البحث والفلاتر والترتيب والصفحات المقسمة.',
        },
        {
          title: 'مسارات التحويل',
          description:
            'ينقل المستخدم من التصفح إلى الاستفسار عبر واتساب والحجز والتواصل وصفحات التفاصيل القوية.',
        },
      ],
    },
    visualPreview: {
      title:
        'اعرض المنتج بالطريقة التي تجعل العميل يرى قيمته فورًا',
      description:
        'هذا القسم يجب أن يوضح الواجهة الحقيقية للمنصة من خلال لقطات واضحة، لا أفكار عامة أو زخارف تسويقية.',
      items: [
        {
          title: 'الصفحة الرئيسية',
          description:
            'عرض الهيرو الفاخر، منطقة البحث، وأقسام السيارات البارزة.',
        },
        {
          title: 'صفحات القوائم',
          description:
            'عرض الفلاتر والترتيب وبطاقات السيارات وتجربة التصفح المكتملة.',
        },
        {
          title: 'صفحة تفاصيل السيارة',
          description:
            'عرض المعرض والسعر والمواصفات ومنطقة الدعوة إلى الإجراء.',
        },
        {
          title: 'نسخة الجوال',
          description:
            'عرض التجربة على الهاتف أثناء اكتشاف السيارات وإرسال الاستفسارات.',
        },
      ],
      demoNote:
        'فيديو قصير يمكن أن يعرض الرحلة من الصفحة الرئيسية إلى صفحة السيارة ثم إلى التواصل.',
    },
    benefits: {
      title:
        'الأثر التجاري أهم من مجرد طريقة البناء',
      items: [
        {
          title: 'أطلق خلال وقت أقل بكثير',
          description:
            'تجاوز مرحلة التأسيس الطويلة وابدأ من منتج صُمم أصلًا لقطاع السيارات.',
        },
        {
          title: 'احصل على تجربة فاخرة بتكلفة أقل',
          description:
            'استفد من واجهة قوية وهيكل جاهز للتحويل دون تمويل مشروع كامل من الصفر.',
        },
        {
          title: 'اجذب عملاء جادين أكثر',
          description:
            'حوّل التصفح إلى استفسارات مباشرة عبر صفحات سيارات أقوى ومسارات تواصل أوضح.',
        },
        {
          title: 'ابنِ الثقة من أول يوم',
          description:
            'قدّم نشاطك بصورة تليق بعلامة سيارات احترافية وتزيد من المصداقية فورًا.',
        },
      ],
    },
    serviceOffering: {
      eyebrow: 'تنفيذ مخصص',
      title:
        'تحتاج أكثر من نسخة جاهزة؟ نحول Caros إلى منصتك الخاصة.',
      description:
        'للشركات والوكالات التي تريد سرعة التنفيذ دون التضحية بالجودة، نقوم بتخصيص Caros حسب الهوية التجارية ونموذج العمل ومتطلبات الإطلاق.',
      bullets: [
        'تخصيص الهوية البصرية والعلامة التجارية',
        'تكييف الصفحات والمحتوى حسب النشاط',
        'تهيئة أدق للعربية والإنجليزية',
        'مواءمة المنصة مع التأجير أو المعارض أو النموذج المختلط',
        'دعم الإطلاق والنشر',
        'تطويرات مستمرة عبر اشتراك أو نطاق مشروع مخصص',
      ],
      cardTitle: 'من أساس قوي إلى منصة مفصلة لعملك',
      cardDescription:
        'ابدأ بـ Caros كأساس جاهز، ثم دعنا نعيد تشكيله ليصبح تجربة تبدو وكأنها بُنيت خصيصًا لعلامتك.',
      primaryCta: 'احجز استشارة',
      secondaryCta: 'اطلب تنفيذًا مخصصًا',
    },
    pricing: {
      title: 'اختر النموذج المناسب لطريقة إطلاقك',
      description:
        'يمكنك شراء المنتج والعمل عليه داخليًا، أو الاعتماد علينا لتنفيذ نسخة مخصصة بالكامل.',
      product: {
        name: 'رخصة المنتج',
        price: 'شراء مرة واحدة',
        audience:
          'للشركات أو الفرق التي تريد المنصة الآن وتستطيع إدارة الإطلاق داخليًا.',
        includes: [
          'الكود الأساسي لـ Caros',
          'صفحات تسويقية وصفحات مخزون احترافية',
          'هيكل جاهز للعربية والإنجليزية',
          'البحث والفلاتر وصفحات تفاصيل السيارات',
          'إرشادات الإعداد والانطلاق',
        ],
        cta: 'اشترِ Caros',
      },
      service: {
        name: 'الخدمة المخصصة',
        price: 'اشتراك شهري أو تسعير حسب المشروع',
        audience:
          'للشركات التي تريد إطلاقًا أسرع مع تخصيص فعلي ودعم في التنفيذ والنشر.',
        includes: [
          'إعداد المنتج وتخصيصه',
          'مواءمة الهوية والمحتوى',
          'دعم الإطلاق',
          'إمكانية التحديثات المستمرة',
        ],
        cta: 'اطلب التسعير',
      },
      footerCta: 'تحدث مع فريق المبيعات',
    },
    useCases: {
      title:
        'مصمم للشركات التي تتحرك داخل سوق السيارات الحقيقي',
      items: [
        {
          title: 'شركات تأجير السيارات',
          description:
            'أطلق موقع أسطول حديث مع مسارات استفسار أقوى.',
        },
        {
          title: 'معارض السيارات',
          description:
            'اعرض المخزون بصورة أكثر ثقة ووضوحًا وجاذبية.',
        },
        {
          title: 'الوكالات',
          description:
            'ابدأ من أساس قوي وقدم مشاريع العملاء بسرعة أكبر.',
        },
        {
          title: 'شركات التنقل الناشئة',
          description:
            'اختبر السوق وانطلق بواجهة احترافية قبل بناء الأنظمة الأعمق.',
        },
      ],
    },
    whyCaros: {
      title: 'ما الذي يجعل Caros مختلفًا',
      description:
        'ليس قالبًا عامًا بواجهة جميلة فقط، بل منصة مبنية أصلًا بعقلية منتج حقيقي لقطاع السيارات.',
      items: [
        'هيكل صفحات قريب من بيئة الإنتاج الفعلية',
        'دعم ثنائي اللغة حقيقي وليس إضافة متأخرة',
        'مبني حول عرض المخزون وتحويل الزيارات إلى عملاء',
        'صفحات سيارات مهيأة للظهور والبحث',
        'مرن للبيع كمنتج أو للتنفيذ كخدمة',
        'تجربة بصرية فاخرة دون الحاجة لإعادة تصميم كاملة',
      ],
      cta: 'قارن وضعك الحالي',
    },
    finalCta: {
      title:
        'انطلق أسرع. اظهر بشكل أقوى. ابدأ بمنصة جاهزة لسوقك.',
      description:
        'إذا كنت تحتاج طريقة أسرع لإطلاق موقع سيارات يبدو احترافيًا وحديثًا وجاهزًا للتحويل، فإن Caros يمنحك الأساس القوي وخيار التنفيذ المخصص الكامل.',
      urgency:
        'كل تأخير في الإطلاق يعني وقتًا أطول قبل أن يرى السوق علامتك بالشكل الذي تستحقه.',
      primaryCta: 'ابدأ الآن',
      secondaryCta: 'احجز عرضًا',
    },
  },
};

export function getLandingContent(locale?: string) {
  return locale === 'ar'
    ? landingContent.ar
    : landingContent.en;
}
