// lib/constants/countryCodes.ts
// ─────────────────────────────────────────────────────────────
// Static country dial-code list for the PhoneField (E2). No external package.
// `dial` is the country calling code WITHOUT the leading '+' (digits only), so
// the full E.164 value is `+${dial}${nationalDigits}`. Default = Syria (SY/963).
//
// Dropdown order: Syria first → Arab/MENA grouped at the top → then every other
// country alphabetically by English name. Each entry has an Arabic name so the
// /ar UI shows Arabic. Searchable by name / nameAr / dial (see PhoneField).
// ─────────────────────────────────────────────────────────────

export type CountryCode = {
  name: string;   // English label
  nameAr: string; // Arabic label
  dial: string;   // calling code, digits only (no '+')
  iso: string;    // ISO-3166 alpha-2
};

export const DEFAULT_COUNTRY_ISO = 'SY';

// ── Arab / MENA group — shown first, in this curated order (Syria default) ────
const MENA_PRIORITY: CountryCode[] = [
  { name: 'Syria',                iso: 'SY', dial: '963', nameAr: 'سوريا' },
  { name: 'Saudi Arabia',         iso: 'SA', dial: '966', nameAr: 'السعودية' },
  { name: 'United Arab Emirates', iso: 'AE', dial: '971', nameAr: 'الإمارات' },
  { name: 'Jordan',               iso: 'JO', dial: '962', nameAr: 'الأردن' },
  { name: 'Lebanon',              iso: 'LB', dial: '961', nameAr: 'لبنان' },
  { name: 'Egypt',                iso: 'EG', dial: '20',  nameAr: 'مصر' },
  { name: 'Iraq',                 iso: 'IQ', dial: '964', nameAr: 'العراق' },
  { name: 'Qatar',                iso: 'QA', dial: '974', nameAr: 'قطر' },
  { name: 'Kuwait',               iso: 'KW', dial: '965', nameAr: 'الكويت' },
  { name: 'Bahrain',              iso: 'BH', dial: '973', nameAr: 'البحرين' },
  { name: 'Oman',                 iso: 'OM', dial: '968', nameAr: 'عُمان' },
  { name: 'Yemen',                iso: 'YE', dial: '967', nameAr: 'اليمن' },
  { name: 'Palestine',            iso: 'PS', dial: '970', nameAr: 'فلسطين' },
  { name: 'Morocco',              iso: 'MA', dial: '212', nameAr: 'المغرب' },
  { name: 'Algeria',              iso: 'DZ', dial: '213', nameAr: 'الجزائر' },
  { name: 'Tunisia',              iso: 'TN', dial: '216', nameAr: 'تونس' },
  { name: 'Libya',                iso: 'LY', dial: '218', nameAr: 'ليبيا' },
  { name: 'Sudan',                iso: 'SD', dial: '249', nameAr: 'السودان' },
  { name: 'Mauritania',           iso: 'MR', dial: '222', nameAr: 'موريتانيا' },
];

// ── Every other country — order here is irrelevant; sorted alphabetically below ─
const OTHER_COUNTRIES: CountryCode[] = [
  { name: 'Afghanistan',                    iso: 'AF', dial: '93',  nameAr: 'أفغانستان' },
  { name: 'Albania',                        iso: 'AL', dial: '355', nameAr: 'ألبانيا' },
  { name: 'Andorra',                        iso: 'AD', dial: '376', nameAr: 'أندورا' },
  { name: 'Angola',                         iso: 'AO', dial: '244', nameAr: 'أنغولا' },
  { name: 'Antigua and Barbuda',            iso: 'AG', dial: '1',   nameAr: 'أنتيغوا وباربودا' },
  { name: 'Argentina',                      iso: 'AR', dial: '54',  nameAr: 'الأرجنتين' },
  { name: 'Armenia',                        iso: 'AM', dial: '374', nameAr: 'أرمينيا' },
  { name: 'Australia',                      iso: 'AU', dial: '61',  nameAr: 'أستراليا' },
  { name: 'Austria',                        iso: 'AT', dial: '43',  nameAr: 'النمسا' },
  { name: 'Azerbaijan',                     iso: 'AZ', dial: '994', nameAr: 'أذربيجان' },
  { name: 'Bahamas',                        iso: 'BS', dial: '1',   nameAr: 'الباهاما' },
  { name: 'Bangladesh',                     iso: 'BD', dial: '880', nameAr: 'بنغلاديش' },
  { name: 'Barbados',                       iso: 'BB', dial: '1',   nameAr: 'باربادوس' },
  { name: 'Belarus',                        iso: 'BY', dial: '375', nameAr: 'بيلاروسيا' },
  { name: 'Belgium',                        iso: 'BE', dial: '32',  nameAr: 'بلجيكا' },
  { name: 'Belize',                         iso: 'BZ', dial: '501', nameAr: 'بليز' },
  { name: 'Benin',                          iso: 'BJ', dial: '229', nameAr: 'بنين' },
  { name: 'Bhutan',                         iso: 'BT', dial: '975', nameAr: 'بوتان' },
  { name: 'Bolivia',                        iso: 'BO', dial: '591', nameAr: 'بوليفيا' },
  { name: 'Bosnia and Herzegovina',         iso: 'BA', dial: '387', nameAr: 'البوسنة والهرسك' },
  { name: 'Botswana',                       iso: 'BW', dial: '267', nameAr: 'بوتسوانا' },
  { name: 'Brazil',                         iso: 'BR', dial: '55',  nameAr: 'البرازيل' },
  { name: 'Brunei',                         iso: 'BN', dial: '673', nameAr: 'بروناي' },
  { name: 'Bulgaria',                       iso: 'BG', dial: '359', nameAr: 'بلغاريا' },
  { name: 'Burkina Faso',                   iso: 'BF', dial: '226', nameAr: 'بوركينا فاسو' },
  { name: 'Burundi',                        iso: 'BI', dial: '257', nameAr: 'بوروندي' },
  { name: 'Cambodia',                       iso: 'KH', dial: '855', nameAr: 'كمبوديا' },
  { name: 'Cameroon',                       iso: 'CM', dial: '237', nameAr: 'الكاميرون' },
  { name: 'Canada',                         iso: 'CA', dial: '1',   nameAr: 'كندا' },
  { name: 'Cape Verde',                     iso: 'CV', dial: '238', nameAr: 'الرأس الأخضر' },
  { name: 'Central African Republic',       iso: 'CF', dial: '236', nameAr: 'جمهورية أفريقيا الوسطى' },
  { name: 'Chad',                           iso: 'TD', dial: '235', nameAr: 'تشاد' },
  { name: 'Chile',                          iso: 'CL', dial: '56',  nameAr: 'تشيلي' },
  { name: 'China',                          iso: 'CN', dial: '86',  nameAr: 'الصين' },
  { name: 'Colombia',                       iso: 'CO', dial: '57',  nameAr: 'كولومبيا' },
  { name: 'Comoros',                        iso: 'KM', dial: '269', nameAr: 'جزر القمر' },
  { name: 'Congo (Brazzaville)',            iso: 'CG', dial: '242', nameAr: 'الكونغو' },
  { name: 'Congo (Kinshasa)',               iso: 'CD', dial: '243', nameAr: 'جمهورية الكونغو الديمقراطية' },
  { name: 'Costa Rica',                     iso: 'CR', dial: '506', nameAr: 'كوستاريكا' },
  { name: "Côte d'Ivoire",                  iso: 'CI', dial: '225', nameAr: 'ساحل العاج' },
  { name: 'Croatia',                        iso: 'HR', dial: '385', nameAr: 'كرواتيا' },
  { name: 'Cuba',                           iso: 'CU', dial: '53',  nameAr: 'كوبا' },
  { name: 'Cyprus',                         iso: 'CY', dial: '357', nameAr: 'قبرص' },
  { name: 'Czechia',                        iso: 'CZ', dial: '420', nameAr: 'التشيك' },
  { name: 'Denmark',                        iso: 'DK', dial: '45',  nameAr: 'الدنمارك' },
  { name: 'Djibouti',                       iso: 'DJ', dial: '253', nameAr: 'جيبوتي' },
  { name: 'Dominica',                       iso: 'DM', dial: '1',   nameAr: 'دومينيكا' },
  { name: 'Dominican Republic',             iso: 'DO', dial: '1',   nameAr: 'جمهورية الدومينيكان' },
  { name: 'Ecuador',                        iso: 'EC', dial: '593', nameAr: 'الإكوادور' },
  { name: 'El Salvador',                    iso: 'SV', dial: '503', nameAr: 'السلفادور' },
  { name: 'Equatorial Guinea',              iso: 'GQ', dial: '240', nameAr: 'غينيا الاستوائية' },
  { name: 'Eritrea',                        iso: 'ER', dial: '291', nameAr: 'إريتريا' },
  { name: 'Estonia',                        iso: 'EE', dial: '372', nameAr: 'إستونيا' },
  { name: 'Eswatini',                       iso: 'SZ', dial: '268', nameAr: 'إسواتيني' },
  { name: 'Ethiopia',                       iso: 'ET', dial: '251', nameAr: 'إثيوبيا' },
  { name: 'Fiji',                           iso: 'FJ', dial: '679', nameAr: 'فيجي' },
  { name: 'Finland',                        iso: 'FI', dial: '358', nameAr: 'فنلندا' },
  { name: 'France',                         iso: 'FR', dial: '33',  nameAr: 'فرنسا' },
  { name: 'Gabon',                          iso: 'GA', dial: '241', nameAr: 'الغابون' },
  { name: 'Gambia',                         iso: 'GM', dial: '220', nameAr: 'غامبيا' },
  { name: 'Georgia',                        iso: 'GE', dial: '995', nameAr: 'جورجيا' },
  { name: 'Germany',                        iso: 'DE', dial: '49',  nameAr: 'ألمانيا' },
  { name: 'Ghana',                          iso: 'GH', dial: '233', nameAr: 'غانا' },
  { name: 'Greece',                         iso: 'GR', dial: '30',  nameAr: 'اليونان' },
  { name: 'Grenada',                        iso: 'GD', dial: '1',   nameAr: 'غرينادا' },
  { name: 'Guatemala',                      iso: 'GT', dial: '502', nameAr: 'غواتيمالا' },
  { name: 'Guinea',                         iso: 'GN', dial: '224', nameAr: 'غينيا' },
  { name: 'Guinea-Bissau',                  iso: 'GW', dial: '245', nameAr: 'غينيا بيساو' },
  { name: 'Guyana',                         iso: 'GY', dial: '592', nameAr: 'غيانا' },
  { name: 'Haiti',                          iso: 'HT', dial: '509', nameAr: 'هايتي' },
  { name: 'Honduras',                       iso: 'HN', dial: '504', nameAr: 'هندوراس' },
  { name: 'Hong Kong',                      iso: 'HK', dial: '852', nameAr: 'هونغ كونغ' },
  { name: 'Hungary',                        iso: 'HU', dial: '36',  nameAr: 'المجر' },
  { name: 'Iceland',                        iso: 'IS', dial: '354', nameAr: 'آيسلندا' },
  { name: 'India',                          iso: 'IN', dial: '91',  nameAr: 'الهند' },
  { name: 'Indonesia',                      iso: 'ID', dial: '62',  nameAr: 'إندونيسيا' },
  { name: 'Iran',                           iso: 'IR', dial: '98',  nameAr: 'إيران' },
  { name: 'Ireland',                        iso: 'IE', dial: '353', nameAr: 'أيرلندا' },
  { name: 'Israel',                         iso: 'IL', dial: '972', nameAr: 'إسرائيل' },
  { name: 'Italy',                          iso: 'IT', dial: '39',  nameAr: 'إيطاليا' },
  { name: 'Jamaica',                        iso: 'JM', dial: '1',   nameAr: 'جامايكا' },
  { name: 'Japan',                          iso: 'JP', dial: '81',  nameAr: 'اليابان' },
  { name: 'Kazakhstan',                     iso: 'KZ', dial: '7',   nameAr: 'كازاخستان' },
  { name: 'Kenya',                          iso: 'KE', dial: '254', nameAr: 'كينيا' },
  { name: 'Kiribati',                       iso: 'KI', dial: '686', nameAr: 'كيريباتي' },
  { name: 'Korea (North)',                  iso: 'KP', dial: '850', nameAr: 'كوريا الشمالية' },
  { name: 'Korea (South)',                  iso: 'KR', dial: '82',  nameAr: 'كوريا الجنوبية' },
  { name: 'Kyrgyzstan',                     iso: 'KG', dial: '996', nameAr: 'قيرغيزستان' },
  { name: 'Laos',                           iso: 'LA', dial: '856', nameAr: 'لاوس' },
  { name: 'Latvia',                         iso: 'LV', dial: '371', nameAr: 'لاتفيا' },
  { name: 'Lesotho',                        iso: 'LS', dial: '266', nameAr: 'ليسوتو' },
  { name: 'Liberia',                        iso: 'LR', dial: '231', nameAr: 'ليبيريا' },
  { name: 'Liechtenstein',                  iso: 'LI', dial: '423', nameAr: 'ليختنشتاين' },
  { name: 'Lithuania',                      iso: 'LT', dial: '370', nameAr: 'ليتوانيا' },
  { name: 'Luxembourg',                     iso: 'LU', dial: '352', nameAr: 'لوكسمبورغ' },
  { name: 'Macau',                          iso: 'MO', dial: '853', nameAr: 'ماكاو' },
  { name: 'Madagascar',                     iso: 'MG', dial: '261', nameAr: 'مدغشقر' },
  { name: 'Malawi',                         iso: 'MW', dial: '265', nameAr: 'مالاوي' },
  { name: 'Malaysia',                       iso: 'MY', dial: '60',  nameAr: 'ماليزيا' },
  { name: 'Maldives',                       iso: 'MV', dial: '960', nameAr: 'المالديف' },
  { name: 'Mali',                           iso: 'ML', dial: '223', nameAr: 'مالي' },
  { name: 'Malta',                          iso: 'MT', dial: '356', nameAr: 'مالطا' },
  { name: 'Marshall Islands',               iso: 'MH', dial: '692', nameAr: 'جزر مارشال' },
  { name: 'Mauritius',                      iso: 'MU', dial: '230', nameAr: 'موريشيوس' },
  { name: 'Mexico',                         iso: 'MX', dial: '52',  nameAr: 'المكسيك' },
  { name: 'Micronesia',                     iso: 'FM', dial: '691', nameAr: 'ميكرونيزيا' },
  { name: 'Moldova',                        iso: 'MD', dial: '373', nameAr: 'مولدوفا' },
  { name: 'Monaco',                         iso: 'MC', dial: '377', nameAr: 'موناكو' },
  { name: 'Mongolia',                       iso: 'MN', dial: '976', nameAr: 'منغوليا' },
  { name: 'Montenegro',                     iso: 'ME', dial: '382', nameAr: 'الجبل الأسود' },
  { name: 'Mozambique',                     iso: 'MZ', dial: '258', nameAr: 'موزمبيق' },
  { name: 'Myanmar',                        iso: 'MM', dial: '95',  nameAr: 'ميانمار' },
  { name: 'Namibia',                        iso: 'NA', dial: '264', nameAr: 'ناميبيا' },
  { name: 'Nauru',                          iso: 'NR', dial: '674', nameAr: 'ناورو' },
  { name: 'Nepal',                          iso: 'NP', dial: '977', nameAr: 'نيبال' },
  { name: 'Netherlands',                    iso: 'NL', dial: '31',  nameAr: 'هولندا' },
  { name: 'New Zealand',                    iso: 'NZ', dial: '64',  nameAr: 'نيوزيلندا' },
  { name: 'Nicaragua',                      iso: 'NI', dial: '505', nameAr: 'نيكاراغوا' },
  { name: 'Niger',                          iso: 'NE', dial: '227', nameAr: 'النيجر' },
  { name: 'Nigeria',                        iso: 'NG', dial: '234', nameAr: 'نيجيريا' },
  { name: 'North Macedonia',                iso: 'MK', dial: '389', nameAr: 'مقدونيا الشمالية' },
  { name: 'Norway',                         iso: 'NO', dial: '47',  nameAr: 'النرويج' },
  { name: 'Pakistan',                       iso: 'PK', dial: '92',  nameAr: 'باكستان' },
  { name: 'Palau',                          iso: 'PW', dial: '680', nameAr: 'بالاو' },
  { name: 'Panama',                         iso: 'PA', dial: '507', nameAr: 'بنما' },
  { name: 'Papua New Guinea',               iso: 'PG', dial: '675', nameAr: 'بابوا غينيا الجديدة' },
  { name: 'Paraguay',                       iso: 'PY', dial: '595', nameAr: 'باراغواي' },
  { name: 'Peru',                           iso: 'PE', dial: '51',  nameAr: 'بيرو' },
  { name: 'Philippines',                    iso: 'PH', dial: '63',  nameAr: 'الفلبين' },
  { name: 'Poland',                         iso: 'PL', dial: '48',  nameAr: 'بولندا' },
  { name: 'Portugal',                       iso: 'PT', dial: '351', nameAr: 'البرتغال' },
  { name: 'Romania',                        iso: 'RO', dial: '40',  nameAr: 'رومانيا' },
  { name: 'Russia',                         iso: 'RU', dial: '7',   nameAr: 'روسيا' },
  { name: 'Rwanda',                         iso: 'RW', dial: '250', nameAr: 'رواندا' },
  { name: 'Saint Kitts and Nevis',          iso: 'KN', dial: '1',   nameAr: 'سانت كيتس ونيفيس' },
  { name: 'Saint Lucia',                    iso: 'LC', dial: '1',   nameAr: 'سانت لوسيا' },
  { name: 'Saint Vincent and the Grenadines', iso: 'VC', dial: '1', nameAr: 'سانت فنسنت والغرينادين' },
  { name: 'Samoa',                          iso: 'WS', dial: '685', nameAr: 'ساموا' },
  { name: 'San Marino',                     iso: 'SM', dial: '378', nameAr: 'سان مارينو' },
  { name: 'Sao Tome and Principe',          iso: 'ST', dial: '239', nameAr: 'ساو تومي وبرينسيب' },
  { name: 'Senegal',                        iso: 'SN', dial: '221', nameAr: 'السنغال' },
  { name: 'Serbia',                         iso: 'RS', dial: '381', nameAr: 'صربيا' },
  { name: 'Seychelles',                     iso: 'SC', dial: '248', nameAr: 'سيشل' },
  { name: 'Sierra Leone',                   iso: 'SL', dial: '232', nameAr: 'سيراليون' },
  { name: 'Singapore',                      iso: 'SG', dial: '65',  nameAr: 'سنغافورة' },
  { name: 'Slovakia',                       iso: 'SK', dial: '421', nameAr: 'سلوفاكيا' },
  { name: 'Slovenia',                       iso: 'SI', dial: '386', nameAr: 'سلوفينيا' },
  { name: 'Solomon Islands',                iso: 'SB', dial: '677', nameAr: 'جزر سليمان' },
  { name: 'Somalia',                        iso: 'SO', dial: '252', nameAr: 'الصومال' },
  { name: 'South Africa',                   iso: 'ZA', dial: '27',  nameAr: 'جنوب أفريقيا' },
  { name: 'South Sudan',                    iso: 'SS', dial: '211', nameAr: 'جنوب السودان' },
  { name: 'Spain',                          iso: 'ES', dial: '34',  nameAr: 'إسبانيا' },
  { name: 'Sri Lanka',                      iso: 'LK', dial: '94',  nameAr: 'سريلانكا' },
  { name: 'Suriname',                       iso: 'SR', dial: '597', nameAr: 'سورينام' },
  { name: 'Sweden',                         iso: 'SE', dial: '46',  nameAr: 'السويد' },
  { name: 'Switzerland',                    iso: 'CH', dial: '41',  nameAr: 'سويسرا' },
  { name: 'Taiwan',                         iso: 'TW', dial: '886', nameAr: 'تايوان' },
  { name: 'Tajikistan',                     iso: 'TJ', dial: '992', nameAr: 'طاجيكستان' },
  { name: 'Tanzania',                       iso: 'TZ', dial: '255', nameAr: 'تنزانيا' },
  { name: 'Thailand',                       iso: 'TH', dial: '66',  nameAr: 'تايلاند' },
  { name: 'Timor-Leste',                    iso: 'TL', dial: '670', nameAr: 'تيمور الشرقية' },
  { name: 'Togo',                           iso: 'TG', dial: '228', nameAr: 'توغو' },
  { name: 'Tonga',                          iso: 'TO', dial: '676', nameAr: 'تونغا' },
  { name: 'Trinidad and Tobago',            iso: 'TT', dial: '1',   nameAr: 'ترينيداد وتوباغو' },
  { name: 'Turkey',                         iso: 'TR', dial: '90',  nameAr: 'تركيا' },
  { name: 'Turkmenistan',                   iso: 'TM', dial: '993', nameAr: 'تركمانستان' },
  { name: 'Tuvalu',                         iso: 'TV', dial: '688', nameAr: 'توفالو' },
  { name: 'Uganda',                         iso: 'UG', dial: '256', nameAr: 'أوغندا' },
  { name: 'Ukraine',                        iso: 'UA', dial: '380', nameAr: 'أوكرانيا' },
  { name: 'United Kingdom',                 iso: 'GB', dial: '44',  nameAr: 'المملكة المتحدة' },
  { name: 'United States',                  iso: 'US', dial: '1',   nameAr: 'الولايات المتحدة' },
  { name: 'Uruguay',                        iso: 'UY', dial: '598', nameAr: 'الأوروغواي' },
  { name: 'Uzbekistan',                     iso: 'UZ', dial: '998', nameAr: 'أوزبكستان' },
  { name: 'Vanuatu',                        iso: 'VU', dial: '678', nameAr: 'فانواتو' },
  { name: 'Vatican City',                   iso: 'VA', dial: '379', nameAr: 'الفاتيكان' },
  { name: 'Venezuela',                      iso: 'VE', dial: '58',  nameAr: 'فنزويلا' },
  { name: 'Vietnam',                        iso: 'VN', dial: '84',  nameAr: 'فيتنام' },
  { name: 'Zambia',                         iso: 'ZM', dial: '260', nameAr: 'زامبيا' },
  { name: 'Zimbabwe',                       iso: 'ZW', dial: '263', nameAr: 'زيمبابوي' },
];

// MENA first (curated order), then everything else alphabetically by English name.
export const COUNTRY_CODES: CountryCode[] = [
  ...MENA_PRIORITY,
  ...[...OTHER_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
];

export const DEFAULT_COUNTRY: CountryCode =
  COUNTRY_CODES.find((c) => c.iso === DEFAULT_COUNTRY_ISO) ?? COUNTRY_CODES[0];

// Dial codes sorted longest-first so prefix matching prefers e.g. 963 over a
// shorter accidental match. Ties keep COUNTRY_CODES order (MENA before others),
// so a shared code like +1 resolves to its first listed country (display only —
// the stored value is unaffected). Used by splitPhone.
const DIALS_BY_LENGTH = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);

/**
 * Normalize a national-number part: digits only (drop spaces/dashes/letters),
 * then strip a SINGLE leading national trunk '0' (e.g. "0944…" → "944…"). Internal
 * zeros are kept ("9440…" stays "9440…"). This is the ONE rule shared by load
 * (splitPhone) and live input (PhoneField) so the two can never diverge.
 */
export function normalizeNational(input: string): string {
  return input.replace(/\D/g, '').replace(/^0/, '');
}

/**
 * Split a stored phone value into a country + national-digit part.
 * - "+963944123456"  → { country: SY, national: "944123456" }   (known +dial)
 * - "00963944…"      → treated as "+963944…"
 * - "0944123456"     → { country: default, national: "944123456" } (no +code; leading trunk 0 stripped)
 * - ""               → { country: default, national: "" }
 * Never drops digits — an unknown +code keeps its digits in `national`.
 */
export function splitPhone(raw: string | null | undefined): { country: CountryCode; national: string } {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { country: DEFAULT_COUNTRY, national: '' };

  // Normalize a leading international "00" to "+".
  const s = trimmed.startsWith('00') ? `+${trimmed.slice(2)}` : trimmed;

  if (s.startsWith('+')) {
    const digits = s.slice(1).replace(/\D/g, '');
    const match = DIALS_BY_LENGTH.find((c) => digits.startsWith(c.dial));
    if (match) return { country: match, national: normalizeNational(digits.slice(match.dial.length)) };
    // Unknown +code: keep all digits in national, default country selected.
    return { country: DEFAULT_COUNTRY, national: digits };
  }

  // No +code: digits only + strip the leading national trunk '0' (e.g. "0944…" →
  // "944…") so it composes to a valid +<dial> number, not "+9630944…". (A "00"
  // prefix was already normalized to "+" above.)
  return { country: DEFAULT_COUNTRY, national: normalizeNational(s) };
}

/**
 * Compose the canonical E.164-style value. Empty national → '' (never fabricate a
 * lone "+963" for an empty optional field, and never blank a value that has digits).
 */
export function composePhone(country: CountryCode, national: string): string {
  const nat = national.replace(/\D/g, '');
  return nat ? `+${country.dial}${nat}` : '';
}
