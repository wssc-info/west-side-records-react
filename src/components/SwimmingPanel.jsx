import RecordRow from './RecordRow';
import { AGE_GROUP_LABEL } from '../data/records';
import { sortEvents } from '../utils/eventSort';

/**
 * SwimmingPanel — left (Team) or right (Pool) records panel.
 * ageOrder: array of JSON keys in display order.
 */
export default function SwimmingPanel({ title, ageGroups, ageOrder, editMode, onEdit }) {
  return (
    <div className="swimming-panel">
      <h2 className="panel-title">{title}</h2>

      {ageOrder.map((key, idx) => {
        const group = ageGroups[key];

        // Sort by stroke type then distance; each entry is { record, originalIdx }
        // so onEdit can still pass the correct JSON array position to the PATCH handler.
        const girls  = sortEvents(group?.girls ?? []);
        const boys   = sortEvents(group?.boys  ?? []);
        const label  = AGE_GROUP_LABEL[key] ?? key;
        const maxLen = Math.max(girls.length, boys.length);

        return (
          <div className="age-group" key={key}>
            {/* Age-group header row */}
            <div className="age-group-header">
              <span className="gender-label">{idx === 0 ? 'GIRLS' : ''}</span>
              <span className="age-label">{label}</span>
              <span className="gender-label">{idx === 0 ? 'BOYS' : ''}</span>
            </div>

            {/* Record rows */}
            {Array.from({ length: maxLen }).map((_, i) => {
              const girl = girls[i] ?? null;
              const boy  = boys[i]  ?? null;
              return (
                <RecordRow
                  key={i}
                  girl={girl?.record ?? null}
                  boy={boy?.record  ?? null}
                  editMode={editMode}
                  onEdit={(side, rec) =>
                    onEdit({
                      panel:  title,
                      ageKey: key,
                      gender: side === 'girl' ? 'girls' : 'boys',
                      idx:    side === 'girl' ? (girl?.originalIdx ?? i) : (boy?.originalIdx ?? i),
                      rec,
                    })
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
