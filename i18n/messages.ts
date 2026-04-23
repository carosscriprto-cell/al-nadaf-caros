const messageFiles = [
  'common',
  'home',
  'services',
  'booking',
  'contact',
  'car',
  'about',
  'faq',
  'legal',
  'filters',
  'buttons',
  'heroForm'
] as const;

export async function loadMessages(locale: string) {
  const bundles = await Promise.all(
    messageFiles.map(async (file) => {
      const mod = await import(`../messages/${locale}/${file}.json`);
      return mod.default;
    })
  );

  return Object.assign({}, ...bundles);
}
