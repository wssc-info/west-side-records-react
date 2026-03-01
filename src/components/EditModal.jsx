import { useState, useEffect } from 'react';

export default function EditModal({ target, onSave, onClose }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (target?.rec) {
      setName(target.rec.name ?? '');
      setYear(String(target.rec.year ?? ''));
      setTime(target.rec.time ?? '');
    }
  }, [target]);

  if (!target) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const yr = parseInt(year, 10);
    if (!name.trim() || isNaN(yr) || yr < 1900 || yr > 2099 || !time.trim()) return;
    onSave({ ...target, updates: { name: name.toUpperCase().trim(), year: yr, time: time.trim() } });
  };

  // Build a readable context description
  const context = [
    target.panel,
    target.ageKey   ? (target.ageKey)   : null,
    target.gender   ? (target.gender === 'girls' ? 'Girls' : 'Boys') : null,
    target.title,       // for diving panels
  ].filter(Boolean).join(' › ');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Edit Record</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-context">{context}</p>

          <form onSubmit={handleSubmit}>
            <label className="modal-label">
              Event
              <input className="modal-input" value={target.rec?.event ?? ''} readOnly />
            </label>

            <label className="modal-label">
              Record Holder(s)
              <input
                className="modal-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </label>

            <label className="modal-label">
              Year Set
              <input
                className="modal-input"
                type="number"
                min={1900}
                max={2099}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </label>

            <label className="modal-label">
              Time / Score
              <input
                className="modal-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 29.35 or 1:23.45"
                required
              />
            </label>

            <div className="modal-actions">
              <button type="submit" className="btn-save">Save Record</button>
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
