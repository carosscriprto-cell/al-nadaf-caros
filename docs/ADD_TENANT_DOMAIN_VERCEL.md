# Add a New Tenant — Domain + Subdomain on Vercel

إضافة معرض سيارات جديد (بيع) أو وكالة تأجير جديدة، مع **نطاق خاص (custom domain)** و **سَب‑دومين (subdomain)**، وتشغيله فعليًا على **Vercel** — وليس فقط محليًا على `lvh.me`.

> This guide picks up where [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md) (the DB runbook) leaves off and adds the **production hosting** layer: env config, Vercel domains, and DNS. Read both — this one is the "make it live on the internet" half.

---

## كيف يتعرّف النظام على المستأجر؟ (How a host resolves to a tenant)

كل طلب يمر على [middleware.ts](../middleware.ts) → `resolveTenantId(host)` في [lib/tenant/resolveTenant.ts](../lib/tenant/resolveTenant.ts). ترتيب الحل (resolution order):

1. **Subdomain → `slug`** — يُستخرج أول label من الـ host بعد إزالة `NEXT_PUBLIC_ROOT_DOMAIN`، ثم `get_tenant_id_by_slug(label)`.
   مثال: `premier.caros.com` → label = `premier` → tenant whose `slug='premier'`.
2. **Full host → `domain` (or `subdomain` column)** — للنطاقات الخاصة `get_tenant_id_by_domain(host)`. الـ SQL يطابق عمود `domain` **أو** `subdomain` على الـ host الكامل.
   مثال: `www.premiermotors.ae` → tenant whose `domain='www.premiermotors.ae'`.
3. **`DEFAULT_TENANT_SLUG`** — fallback للـ apex / localhost / `*.vercel.app` فقط (تطوير أو رابط Vercel العاري).

نقاط مهمة (key behaviors, from the actual code):

- **`*.vercel.app` لا يُعامَل كسَب‑دومين مستأجر.** أي host ينتهي بـ `.vercel.app` يرجع `null` من `extractSubdomain` → يسقط على `DEFAULT_TENANT_SLUG`. فلا تستخدم اسم مشروع Vercel كسلج مستأجر.
- **سَب‑دومين مجهول = 404 صريح، وليس fallback صامت.** `bogus.caros.com` لا يعرض بيانات `dealer1`؛ يجرّب custom-domain match ثم يرجع 404. (هذا مقصود لعزل المستأجرين.)
- **`slug`, `subdomain`, `domain` كلها `unique`** في جدول `tenants`، و الحل يتم فقط على صفوف `active = true`.

---

## ما الذي يحدّد `NEXT_PUBLIC_ROOT_DOMAIN`؟ (The single most important prod env var)

استخراج الـ subdomain يعتمد على هذا المتغيّر:

| `NEXT_PUBLIC_ROOT_DOMAIN` | السلوك |
|---|---|
| **مضبوط** (e.g. `caros.com`) | الـ subdomain = الـ host بعد إزالة `.caros.com`. يدعم أي عمق labels للنطاق الأساسي. `caros.com` و `www.caros.com` → لا subdomain (apex / domain match). |
| **غير مضبوط** | يسقط على heuristic قديم: آخر **2** labels = النطاق الأساسي (يكفي لـ `dealer1.lvh.me` محليًا فقط). |

> **في الإنتاج اضبط `NEXT_PUBLIC_ROOT_DOMAIN` دائمًا** على نطاقك الجذري (بدون `www`، بدون بروتوكول). بدونه، لن يُستخرج السَب‑دومين بشكل صحيح على نطاق متعدد الـ labels.

---

## الخطوات الكاملة (End-to-end)

### Step 0 — مرة واحدة لكل المنصّة (one-time platform setup)

تُعمل مرة واحدة، ليست لكل مستأجر:

1. **Vercel env vars** (Project → Settings → Environment Variables, Production + Preview):

   | Var | Value | ملاحظة |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | |
   | `SUPABASE_URL` | same URL | يستعمله resolver على الـ edge |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role | للـ server mutations فقط |
   | **`NEXT_PUBLIC_ROOT_DOMAIN`** | `caros.com` | حرج — تفعيل استخراج السَب‑دومين |
   | `DEFAULT_TENANT_SLUG` | (اختياري) سلج يُعرض على الـ apex / رابط vercel.app | |

   > بعد تعديل أي env var على Vercel، **Redeploy** حتى تُلتقط القيم.

2. **Wildcard subdomain على Vercel** — Project → Settings → Domains → أضف:
   - `caros.com` (apex)
   - `www.caros.com`
   - **`*.caros.com`** ← الـ wildcard الذي يجعل أي `<slug>.caros.com` يصل للتطبيق دون إضافة كل سَب‑دومين يدويًا.

3. **DNS للنطاق الجذري** (عند مزوّد DNS لـ `caros.com`):
   - `A` / `ALIAS` للـ apex `caros.com` → كما يطلب Vercel (عادة `76.76.21.21` أو الـ ALIAS المقترح).
   - `CNAME` لـ `www` → `cname.vercel-dns.com`.
   - `CNAME` لـ `*` (wildcard) → `cname.vercel-dns.com`. ← هذا يغطّي كل السَب‑دومينات.

   بعد ذلك، **أي مستأجر جديد عبر سَب‑دومين لا يحتاج أي عمل DNS أو Vercel** — فقط صف في قاعدة البيانات.

---

### Step 1 — أنشئ المستأجر في قاعدة البيانات

اتبع [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md) خطوات 1–3 (auth user → `tenants` insert → `tenant_users` link). الحقول المتعلقة بالنطاق في صف `tenants`:

```sql
insert into public.tenants (
  name, name_ar, slug, subdomain, domain,   -- ← identity + host resolution
  plan, active,
  color_primary, color_secondary, color_accent,
  email, phone, whatsapp,
  features
) values (
  'Premier Motors', 'بريمير موتورز',
  'premier',          -- slug      → يحل premier.caros.com
  'premier',          -- subdomain → عادةً = slug (مطابقة احتياطية على الـ host الكامل)
  null,               -- domain    → اتركه NULL الآن؛ يُملأ في Step 3 عند ربط نطاق خاص
  'pro', true,        -- active=true شرط للحل
  '#0A0A0A', '#FFFFFF', '#75ACE8',
  'sales@premier.example', '+9710000000', '+9710000000',
  '{ "maxCars":75,"maxImagesPerCar":8,
     "enableSellCar":true,"enableRental":true,"enableFinancing":true,
     "enableWhatsApp":true,"enableEmailContact":true,"enablePhoneContact":true }'::jsonb
)
returning id;
```

**نوع المستأجر (معرض بيع / وكالة تأجير)** ليس عمودًا — هو فقط الـ feature flags:

| النوع | `enableSellCar` | `enableRental` |
|---|---|---|
| **معرض بيع فقط** (sale-only) | `true` | `false` |
| **وكالة تأجير فقط** (rental-only) | `false` | `true` |
| **هجين** (hybrid) | `true` | `true` |

(انظر جدول presets والتفاصيل الكاملة في [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md).)

---

### Step 2 — السَب‑دومين يعمل فورًا ✅

بمجرّد وجود الصف بـ `active=true`، الرابط:

```
https://premier.caros.com
```

يعمل مباشرة — لأن `*.caros.com` wildcard على Vercel + `NEXT_PUBLIC_ROOT_DOMAIN=caros.com` يجعلان الـ middleware يستخرج `premier` ويطابقه بالـ slug. **لا DNS، لا إعداد Vercel إضافي.**

تحقق:
```bash
curl -I https://premier.caros.com        # 200 = resolved، 404 = لم يُطابق tenant نشط
```
إن حصلت على 404: تأكد أن `slug='premier'` و `active=true`، وأن `NEXT_PUBLIC_ROOT_DOMAIN` مضبوط ثم أعِد النشر.

---

### Step 3 — (اختياري) نطاق خاص للمستأجر (custom domain)

عندما يريد المستأجر نطاقه الخاص `premiermotors.ae` بدل السَب‑دومين:

**3a. على Vercel** — Project → Settings → Domains → أضف:
- `premiermotors.ae`
- `www.premiermotors.ae`

Vercel سيعرض سجلّات DNS المطلوبة.

**3b. عند مزوّد DNS الخاص بالمستأجر** (مالك `premiermotors.ae`):
- `A` للـ apex → IP الذي يعرضه Vercel (e.g. `76.76.21.21`).
- `CNAME` لـ `www` → `cname.vercel-dns.com`.

> هذا نطاق **خارج** `NEXT_PUBLIC_ROOT_DOMAIN`، لذا `extractSubdomain` يرجع `null` ويتم الحل عبر **الـ host الكامل** بدالة `get_tenant_id_by_domain`.

**3c. حدّث صف `tenants` بالـ host الكامل الذي سيزوره الناس:**

```sql
update public.tenants
set domain = 'www.premiermotors.ae'   -- الـ host الكامل تمامًا كما يصل في رأس Host
where slug = 'premier';
```

- خزّن **بالضبط** الـ host الذي يصل في الطلب. إن كان النطاق الأساسي يعيد التوجيه إلى `www`، فالـ host الواصل هو `www.premiermotors.ae` → هذا ما تخزّنه.
- لتغطية الاثنين (`apex` و `www`) يمكنك ضبط الـ apex ليعيد التوجيه إلى `www` على Vercel (Redirect)، فيبقى host واحد فقط يصل للتطبيق.
- `domain` فريد (`unique`) — لا يمكن مشاركته بين مستأجرين.

**3d. تحقق:**
```bash
curl -I https://www.premiermotors.ae     # 200 = الـ custom domain يحل للمستأجر
```

بعد هذا، المستأجر متاح عبر **كليهما**: `premier.caros.com` (السَب‑دومين، يبقى يعمل) و `www.premiermotors.ae` (النطاق الخاص).

---

## التحقق محليًا قبل الإنتاج (Local sanity check)

استخدم `lvh.me` (يحل دائمًا إلى `127.0.0.1`) — لا حاجة لتعديل hosts:

```bash
npm run dev
# ثم زر:
http://premier.lvh.me:3000     # subdomain → slug=premier
http://localhost:3000          # apex → DEFAULT_TENANT_SLUG
```

محليًا `NEXT_PUBLIC_ROOT_DOMAIN` غير مضبوط، فيعمل الـ heuristic القديم (2 labels) ويستخرج `premier` من `premier.lvh.me`. (التفاصيل والنمط ثلاثي المستأجرين في [ONBOARDING_A_TENANT.md](./ONBOARDING_A_TENANT.md).)

---

## استكشاف الأخطاء (Troubleshooting)

| العَرَض | السبب المحتمل | الحل |
|---|---|---|
| السَب‑دومين يعطي **404** | `slug` مختلف، أو `active=false`، أو `NEXT_PUBLIC_ROOT_DOMAIN` غير مضبوط/خاطئ | طابق الـ slug، اجعل `active=true`، اضبط الـ env ثم **Redeploy** |
| السَب‑دومين يعرض **المستأجر الافتراضي** بدل الصحيح | `NEXT_PUBLIC_ROOT_DOMAIN` غير مضبوط → الـ host عُومل كـ apex/vercel.app | اضبط `NEXT_PUBLIC_ROOT_DOMAIN` = نطاقك الجذري |
| رابط `*.vercel.app` يعرض المستأجر الافتراضي (وليس المطلوب) | متوقّع — `.vercel.app` لا يُعامَل كسَب‑دومين مستأجر | اختبر عبر نطاقك الحقيقي `*.caros.com` |
| النطاق الخاص يعطي **404** رغم صحة DNS | عمود `domain` لا يطابق الـ host الواصل (apex مقابل `www`) | خزّن الـ host **الكامل** الواصل فعلًا؛ وحّد عبر redirect apex→www |
| تغييرات env لا تظهر | Vercel لا يلتقط env إلا بنشر جديد | **Redeploy** بعد كل تعديل env |
| تعديل على `tenants` لا ينعكس فورًا | كاش schema في PostgREST | `NOTIFY pgrst, 'reload schema';` |

---

## ملخّص القرار (Quick decision matrix)

| تريد… | اعمل |
|---|---|
| مستأجر جديد على **سَب‑دومين** `x.caros.com` | صف `tenants` فقط بـ `slug='x'`, `active=true` — الـ wildcard يغطّيه |
| إضافة **نطاق خاص** لمستأجر | Vercel domains + DNS عند المالك + `update tenants set domain=...` |
| **معرض بيع** | `enableSellCar:true, enableRental:false` |
| **وكالة تأجير** | `enableSellCar:false, enableRental:true` |
| **هجين** (بيع + تأجير) | كلاهما `true` |
