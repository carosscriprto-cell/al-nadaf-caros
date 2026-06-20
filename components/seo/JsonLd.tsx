// components/seo/JsonLd.tsx — renders a JSON-LD <script> for structured data.
// Server component; safe stringify (no user HTML, and we escape '<' to avoid
// breaking out of the script tag).

export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
