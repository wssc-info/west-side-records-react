import { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL, TEAM_AGE_ORDER, POOL_AGE_ORDER } from './data/records';
import CenterLogo    from './components/CenterLogo';
import SwimmingPanel from './components/SwimmingPanel';
import DivingSection from './components/DivingSection';
import EditModal     from './components/EditModal';
import './App.css';

// ─── helpers ────────────────────────────────────────────────────────────────
const clone = (v) => JSON.parse(JSON.stringify(v));

function applyUpdate(prev, { updates, panel, ageKey, gender, idx, title }) {
  const next = clone(prev);
  if (panel === 'TEAM SWIMMING RECORDS' && ageKey && gender) {
    next.teamRecords.ageGroups[ageKey][gender][idx] = {
      ...next.teamRecords.ageGroups[ageKey][gender][idx], ...updates,
    };
  } else if (panel === 'POOL SWIMMING RECORDS' && ageKey && gender) {
    next.poolRecords.ageGroups[ageKey][gender][idx] = {
      ...next.poolRecords.ageGroups[ageKey][gender][idx], ...updates,
    };
  } else if (title === 'TEAM DIVING RECORDS') {
    next.divingRecords.team[gender][idx] = {
      ...next.divingRecords.team[gender][idx], ...updates,
    };
  } else if (title === 'POOL DIVING RECORDS') {
    next.divingRecords.pool[gender][idx] = {
      ...next.divingRecords.pool[gender][idx], ...updates,
    };
  }
  return next;
}

// ─── component ───────────────────────────────────────────────────────────────
export default function App() {
  const [records,    setRecords]    = useState(null);   // null = not yet loaded
  const [loadState,  setLoadState]  = useState('loading'); // 'loading' | 'ok' | 'error'
  const [loadError,  setLoadError]  = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');  // 'idle' | 'saving' | 'saved' | 'error'
  const [editMode,   setEditMode]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Keep a ref in sync so handleSave can read the latest without stale closure
  const recordsRef = useRef(records);
  useEffect(() => { recordsRef.current = records; }, [records]);

  // ── Fetch records from API on mount ───────────────────────────────────────
  const fetchRecords = useCallback(() => {
    setLoadState('loading');
    setLoadError('');

    fetch(API_URL, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setRecords(data);
        setLoadState('ok');
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoadState('error');
      });
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Save a single record edit ─────────────────────────────────────────────
  const handleSave = useCallback((editPayload) => {
    const prev = recordsRef.current;          // capture before optimistic update
    const next = applyUpdate(prev, editPayload);
    setRecords(next);                         // optimistic update
    setEditTarget(null);
    setSaveStatus('saving');

    // Send only the delta — the PHP PATCH handler navigates to the right record
    const { panel, ageKey, gender, idx, title, updates } = editPayload;

    fetch(API_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ panel, ageKey, gender, idx, title, updates }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Save failed: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      })
      .catch((err) => {
        setSaveStatus('error');
        console.error('Save error:', err);
        setRecords(prev);   // roll back to state captured before optimistic update
      });
  }, []);

  // ── Render states ─────────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <div className="app-shell">
        <div className="state-screen">
          <div className="spinner" />
          <p>Loading records from server…</p>
          <code className="api-url-hint">{API_URL}</code>
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="app-shell">
        <div className="state-screen state-error">
          <div className="state-icon">⚠</div>
          <h2>Could not load records</h2>
          <p className="error-msg">{loadError}</p>
          <code className="api-url-hint">{API_URL}</code>
          <p className="error-hint">
            Make sure the PHP server is running:<br />
            <code>php -S localhost:8080</code> from <code>phpRecordManagement/</code>
          </p>
          <button className="btn-retry" onClick={fetchRecords}>↺ Retry</button>
        </div>
      </div>
    );
  }

  const { teamRecords, poolRecords, divingRecords } = records;

  return (
    <div className="app-shell">
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="toolbar">
        <span className="toolbar-title">
          West Side Swim Club &mdash; Record Board {records.year}
        </span>
        <div className="toolbar-actions">
          {saveStatus === 'saving' && <span className="save-badge saving">Saving…</span>}
          {saveStatus === 'saved'  && <span className="save-badge saved">✓ Saved</span>}
          {saveStatus === 'error'  && <span className="save-badge save-err">Save failed</span>}

          <button
            className={'tool-btn' + (editMode ? ' active' : '')}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? '✓ Done Editing' : '✎ Edit Records'}
          </button>

          <button
            className="tool-btn"
            onClick={fetchRecords}
            title={`Reload from ${API_URL}`}
          >
            ↺ Reload
          </button>
        </div>
      </div>

      {/* ── Board ────────────────────────────────────────────── */}
      <div className="board-outer">
        <div className="board">
          <div className="board-main">
            <SwimmingPanel
              title="TEAM SWIMMING RECORDS"
              ageGroups={teamRecords.ageGroups}
              ageOrder={TEAM_AGE_ORDER}
              editMode={editMode}
              onEdit={setEditTarget}
            />
            <div className="center-panel">
              <CenterLogo />
              <div className="board-diving">
                <DivingSection
                    title="TEAM DIVING RECORDS"
                    girls={divingRecords.team.girls}
                    boys={divingRecords.team.boys}
                    editMode={editMode}
                    onEdit={setEditTarget}
                />
                <DivingSection
                    title="POOL DIVING RECORDS"
                    girls={divingRecords.pool.girls}
                    boys={divingRecords.pool.boys}
                    editMode={editMode}
                    onEdit={setEditTarget}
                />
              </div>
            </div>
            <SwimmingPanel
              title="POOL SWIMMING RECORDS"
              ageGroups={poolRecords.ageGroups}
              ageOrder={POOL_AGE_ORDER}
              editMode={editMode}
              onEdit={setEditTarget}
            />
          </div>

        </div>
      </div>

      <EditModal
        target={editTarget}
        onSave={handleSave}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
