/**
 * eventSort.js — sorting utility for swimming event rows.
 *
 * Sort order: stroke type first (FREE → BACK → BREAST → FLY → MEDLEY RELAY → FREE RELAY),
 * then by distance (50 → 100 → 200) within each stroke.
 */

const STROKE_ORDER = {
  'FREE':          0,
  'BACK':          10,
  'BREAST':        20,
  'FLY':           30,
  'I.M.':           40,
  'MEDLEY RELAY':  50,
  'FREE RELAY':    60,
};

/**
 * Parse "50 FREE" → { distance: 50, stroke: 'FREE' }
 *       "100 MEDLEY RELAY" → { distance: 100, stroke: 'MEDLEY RELAY' }
 */
function parseEvent(name = '') {
  const upper    = name.trim().toUpperCase();
  const spaceIdx = upper.indexOf(' ');
  const distance = spaceIdx > -1 ? parseInt(upper.slice(0, spaceIdx), 10) : 0;
  const stroke   = spaceIdx > -1 ? upper.slice(spaceIdx + 1).trim() : upper;
  return { distance, stroke };
}

/**
 * Return a new array of { record, originalIdx } objects sorted by
 * stroke type then by distance.  The originalIdx tracks where each
 * record lived in the unsorted source array so PATCH edits still
 * reference the correct JSON position.
 *
 * @param {Array} rows  Array of record objects (each must have an `event` field).
 * @returns {Array<{ record: object, originalIdx: number }>}
 */
export function sortEvents(rows = []) {
  return rows
    .map((record, originalIdx) => ({ record, originalIdx }))
    .sort((a, b) => {
      const ea = parseEvent(a.record.event);
      const eb = parseEvent(b.record.event);
      const strokeDiff = (STROKE_ORDER[ea.stroke] ?? 99) - (STROKE_ORDER[eb.stroke] ?? 99);
      return strokeDiff !== 0 ? strokeDiff : ea.distance - eb.distance;
    });
}
