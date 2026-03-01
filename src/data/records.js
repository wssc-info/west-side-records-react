// ─────────────────────────────────────────────────────────────────────────────
// West Side Record Board — constants only.
// All record data is loaded at runtime from the API server (see VITE_RECORDS_API).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps JSON age-group keys → display labels shown on the board.
 * The JSON keys are offset by one bracket from the display label because the
 * original board tracks "8 & UNDER" with keys that read "9-10", etc.
 */
export const AGE_GROUP_LABEL = {
  '8Under':             '8 & UNDER',
  '9-10':            '9 - 10',
  '11-12':            '11 - 12',
  '13-14':            '13 - 14',
  '15-18':      '15 - 18',
};

/** Ordered list of JSON age-group keys for the Team Records panel. */
export const TEAM_AGE_ORDER = ['8Under', '9-10', '11-12', '13-14', '15-18'];

/** Ordered list of JSON age-group keys for the Pool Records panel. */
export const POOL_AGE_ORDER = ['8Under', '9-10', '11-12', '13-14', '15-18'];

/**
 * API base URL — set VITE_RECORDS_API in your .env file.
 * Falls back to the PHP dev server on the standard port.
 */
export const API_URL = import.meta.env.VITE_RECORDS_API ?? 'http://localhost:8080/api/records.php';
