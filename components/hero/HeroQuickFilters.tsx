'use client';

// Carwow-style quick-filter chips. Purely presentational and data-driven: the
// panel derives the chips from real inventory and owns the toggle logic, so this
// component has no filtering knowledge and no boolean-mode props — it just
// renders a calm, token-styled row of toggle buttons.

export type QuickChip = {
  /** Stable key */
  id: string;
  /** Localised display label */
  label: string;
  /** Whether the underlying filter is currently applied */
  active: boolean;
  /** Apply on first click, clear on second */
  onToggle: () => void;
};

export default function HeroQuickFilters({
  chips,
  label,
}: {
  chips: QuickChip[];
  label: string;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          aria-pressed={chip.active}
          onClick={chip.onToggle}
          className={`
            rounded-full border px-3.5 py-2 text-xs font-medium
            transition-colors duration-200
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40
            ${
              chip.active
                ? 'border-accent/30 bg-accent-subtle text-accent'
                : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:bg-accent-subtle hover:text-foreground'
            }
          `}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
