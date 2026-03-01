import RecordName from './RecordName';

/**
 * RecordRow — one swimming record row.
 * Girls data on left, event label in center, boys data on right.
 */
export default function RecordRow({ girl, boy, onEdit, editMode }) {
  return (
    <div className="record-row">
      {/* ── Girls side ─────────────────────── */}
      <div className="side girls-side">
        {girl ? (
          <>
            <RecordName name={girl.name} side="girls" />
            <span className="rec-year">{girl.year}</span>
            <span className="rec-time girls-time">{girl.time}</span>
            {editMode && (
              <button
                className="edit-btn"
                title="Edit girls record"
                onClick={() => onEdit('girl', girl)}
              >✎</button>
            )}
          </>
        ) : <span className="empty-side" />}
      </div>

      {/* ── Event label ────────────────────── */}
      <div className="event-col">
        {(girl || boy)?.event ?? ''}
      </div>

      {/* ── Boys side ──────────────────────── */}
      <div className="side boys-side">
        {boy ? (
          <>
            {editMode && (
              <button
                className="edit-btn"
                title="Edit boys record"
                onClick={() => onEdit('boy', boy)}
              >✎</button>
            )}
              <RecordName name={boy.name} side="boys" />
              <span className="rec-time boys-time">{boy.time}</span>
              <span className="rec-year">{boy.year}</span>
          </>
        ) : <span className="empty-side" />}
      </div>
    </div>
  );
}
