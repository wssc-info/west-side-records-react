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
  const [records,    setRecords]    = useState(null);
  const [loadState,  setLoadState]  = useState('loading');
  const [loadError,  setLoadError]  = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [editMode,   setEditMode]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [pdfState,   setPdfState]   = useState('idle'); // 'idle' | 'exporting'
  const [svgState,   setSvgState]   = useState('idle'); // 'idle' | 'exporting'

  // Keep a ref in sync so handleSave can read the latest without stale closure
  const recordsRef = useRef(records);
  useEffect(() => { recordsRef.current = records; }, [records]);

  // Ref to the board element for PDF capture
  const boardRef = useRef(null);

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
    const prev = recordsRef.current;
    const next = applyUpdate(prev, editPayload);
    setRecords(next);
    setEditTarget(null);
    setSaveStatus('saving');

    const { panel, ageKey, gender, idx, title, updates, rec } = editPayload;
    // event identifies the row in the DB; swimming uses rec.event, diving uses rec.ageGroup
    const event = rec?.event ?? rec?.ageGroup ?? null;

    fetch(API_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ panel, ageKey, gender, idx, title, updates, event }),
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
        setRecords(prev);
      });
  }, []);

  // ── Export board as poster PDF ────────────────────────────────────────────
  const exportToPDF = useCallback(async () => {
    const board = boardRef.current;
    if (!board || pdfState === 'exporting') return;

    setPdfState('exporting');
    try {
      // Lazy-load the heavy libs so they don't bloat the initial bundle
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      // Capture the board at 3× pixel density for poster-quality output.
      // scale:3 on a 2000×1000 board → 6000×3000px canvas ≈ 167 DPI on 36".
      const canvas = await html2canvas(board, {
        scale: 3,
        useCORS: true,          // allow cross-origin images (e.g. centerlogo.png)
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Build a landscape PDF at 36"×18" (2:1, matching the board)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [36, 18],
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 36, 18);
      pdf.save(`west-side-record-board-${new Date().getFullYear()}.pdf`);

      setPdfState('idle');
    } catch (err) {
      console.error('PDF export failed:', err);
      setPdfState('idle');
      alert('PDF export failed. See console for details.');
    }
  }, [pdfState]);

  // ── Export board as SVG ───────────────────────────────────────────────────
  const exportToSVG = useCallback(async () => {
    const board = boardRef.current;
    if (!board || svgState === 'exporting') return;

    setSvgState('exporting');
    try {
      const { toSvg } = await import('html-to-image');

      const dataUrl = await toSvg(board, {
        width: 2000,
        height: 1000,
        style: { margin: '0' },
      });

      const link = document.createElement('a');
      link.download = `west-side-record-board-${new Date().getFullYear()}.svg`;
      link.href = dataUrl;
      link.click();

      setSvgState('idle');
    } catch (err) {
      console.error('SVG export failed:', err);
      setSvgState('idle');
      alert('SVG export failed. See console for details.');
    }
  }, [svgState]);

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
        <div className="toolbar-left">
          <span className="toolbar-title">
            West Side Swim Club &mdash; Record Board {records.year}
          </span>
          <a
            className="tool-btn"
            href="/data/records.json"
            target="_blank"
            rel="noreferrer"
            title="Open live records.json"
          >Records</a>
          <a
            className="tool-btn"
            href="/data/changes.log"
            target="_blank"
            rel="noreferrer"
            title="Open live changes.log"
          >Changes</a>
        </div>
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

          <button
            className={'tool-btn print-btn' + (pdfState === 'exporting' ? ' exporting' : '')}
            onClick={exportToPDF}
            disabled={pdfState === 'exporting'}
            title="Capture board as a 36″ × 18″ poster PDF"
          >
            {pdfState === 'exporting' ? '⏳ Generating…' : '⎙ Export PDF'}
          </button>

          <button
            className={'tool-btn print-btn' + (svgState === 'exporting' ? ' exporting' : '')}
            onClick={exportToSVG}
            disabled={svgState === 'exporting'}
            title="Export board as an SVG file"
          >
            {svgState === 'exporting' ? '⏳ Generating…' : '⎙ Export SVG'}
          </button>
        </div>
      </div>

      {/* ── Board ────────────────────────────────────────────── */}
      <div className="board-outer">
        <div className="board" ref={boardRef}>
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
                    showBoyGirlsLabels={true}
                />
                <DivingSection
                    title="POOL DIVING RECORDS"
                    girls={divingRecords.pool.girls}
                    boys={divingRecords.pool.boys}
                    editMode={editMode}
                    onEdit={setEditTarget}
                    showBoyGirlsLabels={false}
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
