// Fixed light/dark swatches for theme previews — copied from the token
// values in index.css. These intentionally do NOT use the live CSS
// variables: a "Dark" preview has to look dark even while the page itself is
// in light mode (and vice versa), so it can't react to the current theme.
const PREVIEW_PALETTES = {
  light: {
    bg: "hsl(228 25% 95.3%)",
    card: "hsl(0 0% 100%)",
    bar: "hsl(240 22.2% 96.5%)",
    accent: "hsl(239 84.5% 72.2%)",
  },
  dark: {
    bg: "hsl(240 15% 9%)",
    card: "hsl(240 14% 12%)",
    bar: "hsl(240 10% 18%)",
    accent: "hsl(239 84.5% 72.2%)",
  },
};

export function ThemePreview({ variant }) {
  if (variant === "system") {
    return (
      <span className="flex h-16 w-full overflow-hidden rounded-lg border border-border">
        {["dark", "light"].map((half) => (
          <span
            key={half}
            className="w-1/2 h-full p-2 flex flex-col gap-1.5"
            style={{ background: PREVIEW_PALETTES[half].bg }}
          >
            <span
              className="h-1.5 w-3/4 rounded-full"
              style={{ background: PREVIEW_PALETTES[half].accent }}
            />
            <span
              className="h-1.5 w-1/2 rounded-full"
              style={{ background: PREVIEW_PALETTES[half].bar }}
            />
          </span>
        ))}
      </span>
    );
  }

  const p = PREVIEW_PALETTES[variant];
  return (
    <span
      className="flex h-16 w-full flex-col gap-1.5 rounded-lg border border-border p-2"
      style={{ background: p.bg }}
    >
      <span className="h-1.5 w-3/4 rounded-full" style={{ background: p.accent }} />
      <span className="h-1.5 w-1/2 rounded-full" style={{ background: p.bar }} />
      <span className="h-1.5 w-2/3 rounded-full" style={{ background: p.bar }} />
    </span>
  );
}
