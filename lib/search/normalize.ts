const ARABIC_CHAR_MAP: Record<string, string> = {
  'أ': 'ا',
  'إ': 'ا',
  'آ': 'ا',
  'ة': 'ه',
  'ى': 'ي',
};

const SPECIAL_CHARACTERS_REGEX =
  /[^0-9a-zA-Z\u0600-\u06FF\s]+/g;
const MULTI_SPACE_REGEX = /\s+/g;

export function normalize(text = ''): string {
  const trimmed = text.trim().toLowerCase();

  if (!trimmed) {
    return '';
  }

  const arabicNormalized = Array.from(trimmed, (character) => {
    return ARABIC_CHAR_MAP[character] ?? character;
  }).join('');

  return arabicNormalized
    .replace(SPECIAL_CHARACTERS_REGEX, ' ')
    .replace(MULTI_SPACE_REGEX, ' ')
    .trim();
}
