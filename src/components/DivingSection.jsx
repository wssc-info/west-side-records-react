import RecordName from './RecordName';

/**
 * DivingSection — bottom Team Diving / Pool Diving records.
 * Layout mirrors swimming: girls on left, age-group in center, boys on right.
 */
function DivingRow({ girl, boy, editMode, onEdit }) {
  return (
    <div className="record-row diving-row">
      {/* Girls side */}
      <div className="side girls-side">
        {girl ? (
          <>
            <RecordName name={girl.name} side="girls" />
            <span className="rec-year">{girl.year}</span>
            <span className="rec-time girls-time">{girl.time}</span>
            {editMode && (
              <button className="edit-btn" title="Edit" onClick={() => onEdit('girls', girl)}>✎</button>
            )}
          </>
        ) : null}
      </div>

      {/* Age-group label in center */}
      <div className="event-col">
        {(girl ?? boy)?.ageGroup ?? ''}
      </div>

      {/* Boys side */}
      <div className="side boys-side">
        {boy ? (
          <>
            {editMode && (
              <button className="edit-btn" title="Edit" onClick={() => onEdit('boys', boy)}>✎</button>
            )}
            <span className="rec-time boys-time">{boy.time}</span>
            <span className="rec-year">{boy.year}</span>
            <RecordName name={boy.name} side="boys" />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function DivingSection({ title, girls, boys, editMode, onEdit }) {
  const maxLen = Math.max(girls.length, boys.length);
  return (
    <div className="diving-panel">
      <h3 className="diving-title">{title}</h3>

      <div className="age-group-header">
        <span className="gender-label">GIRLS</span>
        <span className="age-label" />
        <span className="gender-label">BOYS</span>
      </div>

      {Array.from({ length: maxLen }).map((_, i) => (
        <DivingRow
          key={i}
          girl={girls[i]  ?? null}
          boy={boys[i]    ?? null}
          editMode={editMode}
          onEdit={(gender, rec) => onEdit({ title, gender, idx: i, rec })}
        />
      ))}
    </div>
  );
}
