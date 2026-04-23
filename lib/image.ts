const toBase64 = (value: string) =>
  typeof window === 'undefined'
    ? Buffer.from(value).toString('base64')
    : window.btoa(value);

export function getBlurDataURL(
  startColor = '#1f2937',
  endColor = '#111827'
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" fill="url(#g)" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}
