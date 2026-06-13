export function calcNights(from: string, to: string): number {
  if (!from || !to) return 0;
  return Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000),
  );
}