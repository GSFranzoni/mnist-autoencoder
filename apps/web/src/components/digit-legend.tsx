const digitColorTokens = Array.from({ length: 10 }, (_, label) => `--color-digit-${label}`);

export function DigitLegend() {
  return (
    <span className="hidden items-center gap-1.5 sm:inline-flex" aria-label="Digit colour legend">
      {digitColorTokens.map((token, label) => (
        <span
          key={label}
          className="text-foreground-muted inline-flex items-center gap-1 text-[.65rem]"
        >
          <i className="size-1.5 rounded-full" style={{ backgroundColor: `var(${token})` }} />
          {label}
        </span>
      ))}
    </span>
  );
}
