import RecordRow from './RecordRow';
import { AGE_GROUP_LABEL } from '../data/records';

/**
 * SwimmingPanel — left (Team) or right (Pool) records panel.
 * ageOrder: array of JSON keys in display order.
 */
export default function SwimmingPanel({ title, ageGroups, ageOrder, editMode, onEdit }) {
  return (
    <div className="swimming-panel">
      <h2 className="panel-title">{title}</h2>

      {ageOrder.map((key) => {
        const group  = ageGroups[key];
        const girls  = group?.girls ?? [];
        const boys   = group?.boys  ?? [];
        const label  = AGE_GROUP_LABEL[key] ?? key;
        const maxLen = Math.max(girls.length, boys.length);

        return (
          <div className="age-group" key={key}>
            {/* Age-group header row */}
            <div className="age-group-header">
              <span className="gender-label">GIRLS</span>
              <span className="age-label">{label}</span>
              <span className="gender-label">BOYS</span>
            </div>

            {/* Record rows */}
            {Array.from({ length: maxLen }).map((_, i) => (
              <RecordRow
                key={i}
                girl={girls[i] ?? null}
                boy={boys[i]  ?? null}
                editMode={editMode}
                onEdit={(side, rec) =>
                  onEdit({ panel: title, ageKey: key, gender: side === 'girl' ? 'girls' : 'boys', idx: i, rec })
                }
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
