/**
 * RecordName
 *
 * Renders a record-holder name field that may contain a comma-separated list
 * (e.g. relay teams: "JANE DOE, AMY SMITH, SUE JONES, KIM LEE").
 *
 * Layout rules:
 *   • 1 name  → single line
 *   • 2 names → both on one line
 *   • 3 names → line 1: names 1–2,  line 2: name 3
 *   • 4 names → line 1: names 1–2,  line 2: names 3–4
 *
 * Each line is kept on a single line (white-space: nowrap).
 *
 * Props:
 *   name  — the raw string from the record (may contain commas)
 *   side  — "girls" | "boys"  (drives left/right alignment via CSS)
 */
export default function RecordName({ name, side }) {
  if (!name) return null;

  const parts = name.split(',').map((s) => s.trim()).filter(Boolean);

  // Group into pairs: ["A, B", "C, D"]
  const lines = [];
  for (let i = 0; i < parts.length; i += 2) {
    lines.push(parts.slice(i, i + 2).join(', '));
  }

  return (
    <div className={`rec-name ${side}-name`}>
      {lines.map((line, i) => (
        <span key={i} className="rec-name-line">{line}</span>
      ))}
    </div>
  );
}
