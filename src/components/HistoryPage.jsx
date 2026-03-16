import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../data/records';

const HISTORY_URL = API_URL.replace(/\/[^/]+$/, '/history.php');

const PANEL_LABELS = {
  team_swimming: 'Team Swimming',
  pool_swimming: 'Pool Swimming',
  team_diving:   'Team Diving',
  pool_diving:   'Pool Diving',
};

function Changed({ oldVal, newVal }) {
  const changed = oldVal !== newVal;
  return (
    <span className={changed ? 'hist-changed' : 'hist-same'}>
      {changed ? <><s className="hist-old">{oldVal}</s> → <strong>{newVal}</strong></> : newVal}
    </span>
  );
}

function uniq(arr) {
  return [...new Set(arr)].sort();
}

function sortAgeGroups(groups) {
  return [...groups].sort((a, b) => parseInt(a) - parseInt(b));
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const [aNum, ...aRest] = a.split(' ');
    const [bNum, ...bRest] = b.split(' ');
    const numDiff = Number(aNum) - Number(bNum);
    if (numDiff !== 0) return numDiff;
    return aRest.join(' ').localeCompare(bRest.join(' '));
  });
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="hist-filter">
      <span className="hist-filter-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export default function HistoryPage() {
  const [history,   setHistory]   = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');

  const [filterPanel,    setFilterPanel]    = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterGender,   setFilterGender]   = useState('');
  const [filterEvent,    setFilterEvent]    = useState('');

  useEffect(() => {
    setLoadState('loading');
    fetch(HISTORY_URL, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setHistory(data.history ?? []);
        setLoadState('ok');
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoadState('error');
      });
  }, []);

  const panelOptions    = useMemo(() => history ? uniq(history.map((r) => PANEL_LABELS[r.panel] ?? r.panel)) : [], [history]);
  const ageGroupOptions = useMemo(() => history ? sortAgeGroups(uniq(history.map((r) => r.age_group))) : [], [history]);
  const genderOptions   = useMemo(() => history ? uniq(history.map((r) => r.gender)) : [], [history]);
  const eventOptions    = useMemo(() => {
    if (!history) return [];
    const base = filterPanel
      ? history.filter((r) => (PANEL_LABELS[r.panel] ?? r.panel) === filterPanel)
      : history;
    return sortEvents(uniq(base.map((r) => r.event)));
  }, [history, filterPanel]);

  const filtered = useMemo(() => {
    if (!history) return [];
    return history.filter((r) => {
      if (filterPanel    && (PANEL_LABELS[r.panel] ?? r.panel) !== filterPanel) return false;
      if (filterAgeGroup && r.age_group !== filterAgeGroup) return false;
      if (filterGender   && r.gender    !== filterGender)   return false;
      if (filterEvent    && r.event     !== filterEvent)    return false;
      return true;
    });
  }, [history, filterPanel, filterAgeGroup, filterGender, filterEvent]);

  const hasFilters = filterPanel || filterAgeGroup || filterGender || filterEvent;
  function clearFilters() {
    setFilterPanel(''); setFilterAgeGroup(''); setFilterGender(''); setFilterEvent('');
  }

  if (loadState === 'loading') {
    return (
      <div className="hist-state">
        <div className="spinner" />
        <p>Loading history…</p>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="hist-state hist-state--error">
        <div className="state-icon">⚠</div>
        <p>{loadError}</p>
      </div>
    );
  }

  if (!history.length) {
    return <div className="hist-state"><p>No history found.</p></div>;
  }

  return (
    <div className="hist-wrap">
      <div className="hist-header">
        <h2 className="hist-title">Change History</h2>
        <span className="hist-count">
          {filtered.length}{hasFilters ? ` of ${history.length}` : ''} change{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="hist-filters">
        <FilterSelect label="Panel"     value={filterPanel}    options={panelOptions}    onChange={setFilterPanel} />
        <FilterSelect label="Age Group" value={filterAgeGroup} options={ageGroupOptions} onChange={setFilterAgeGroup} />
        <FilterSelect label="Gender"    value={filterGender}   options={genderOptions}   onChange={setFilterGender} />
        <FilterSelect label="Event"     value={filterEvent}    options={eventOptions}    onChange={setFilterEvent} />
        {hasFilters && (
          <button className="hist-clear-btn" onClick={clearFilters}>✕ Clear</button>
        )}
      </div>

      <div className="hist-table-wrap">
        {filtered.length === 0 ? (
          <div className="hist-state"><p>No changes match the selected filters.</p></div>
        ) : (
          <table className="hist-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Panel</th>
                <th>Age Group</th>
                <th>Gender</th>
                <th>Event</th>
                <th>Name</th>
                <th>Year</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="hist-date">{row.changed_at}</td>
                  <td>{PANEL_LABELS[row.panel] ?? row.panel}</td>
                  <td>{row.age_group}</td>
                  <td className="hist-cap">{row.gender}</td>
                  <td>{row.event}</td>
                  <td><Changed oldVal={row.old_name} newVal={row.new_name} /></td>
                  <td><Changed oldVal={String(row.old_year)} newVal={String(row.new_year)} /></td>
                  <td><Changed oldVal={row.old_time} newVal={row.new_time} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
