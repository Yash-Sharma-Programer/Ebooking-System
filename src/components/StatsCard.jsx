import clsx from "clsx";

const accentMap = {
  sage: "text-sage",
  marquee: "text-marquee",
  danger: "text-danger",
  slate: "text-slate",
};

/**
 * @param {{ label: string, value: number, accent?: "sage"|"marquee"|"danger"|"slate" }} props
 */
export default function StatsCard({ label, value, accent = "slate" }) {
  return (
    <div className="rounded-xl border border-paper/10 bg-ink-soft/60 px-5 py-4">
      <p className="text-xs uppercase tracking-widest text-paper/50 font-mono mb-1">{label}</p>
      <p className={clsx("font-display text-4xl tracking-wide", accentMap[accent])}>{value}</p>
    </div>
  );
}
