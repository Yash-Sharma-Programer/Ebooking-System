const items = [
  { label: "Available", swatch: "bg-transparent border-sage" },
  { label: "Selected", swatch: "bg-marquee border-marquee" },
  { label: "Booked", swatch: "bg-ink-soft border-ink-soft" },
  { label: "Unavailable", swatch: "bg-danger-soft/10 border-danger/50" },
];

export default function SeatLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-paper/70">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className={`inline-block w-4 h-4 rounded border ${item.swatch}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
