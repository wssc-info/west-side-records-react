/**
 * RecordName
 *
 * Renders a record-holder name field that may contain a comma-separated list
 * (e.g. relay teams: "JANE DOE, AMY SMITH, SUE JONES, KIM LEE").
 *
 * Each individual name is kept on a single line (white-space: nowrap),
 * but the group as a whole can wrap so long names don't overflow the cell.
 *
 * Props:
 *   name  — the raw string from the record (may contain commas)
 *   side  — "girls" | "boys"  (drives left/right justification via CSS)
 */
export default function RecordName({ name, side }) {
  if (!name) return null;

  const parts = name.split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <div className={`rec-name ${side}-name`}>
      {parts.map((part, i) => (
        <span key={i} className="rec-name-part">
          {part}{i < parts.length - 1 ? ',' : ''}
        </span>
      ))}
    </div>
  );
}
