// Local persistence for word statuses, test history, and streaks. Unlike
// testService.js (pure, no I/O), this module owns the one place the app
// touches localStorage - the same "I/O boundary" role audioService.js plays
// for speech synthesis. Every read/write is wrapped in try/catch: Safari
// private browsing (and some privacy extensions) can throw just touching
// `localStorage`, and persistence is a nice-to-have that must never crash
// or block the app.

const STORAGE_KEY = 'carlo:v1';
const STORAGE_VERSION = 1;
const HISTORY_LIMIT = 200;

function defaultState() {
    return {
        statuses: {},
        history: [],
        streak: { current: 0, longest: 0, lastActiveDate: null },
        activeSession: null
    };
}

// Loose shape check, not a full schema validation - just enough to catch
// corrupt/foreign data and fall back to starting a fresh test rather than
// handing the app something it can't render.
function isValidActiveSession(session) {
    return !!session
        && Array.isArray(session.items) && session.items.length > 0
        && Array.isArray(session.wordOrder)
        && Array.isArray(session.cardOrder)
        && session.results && typeof session.results === 'object';
}

export function loadPersistedState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState();

        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== STORAGE_VERSION) return defaultState();

        return {
            statuses: parsed.statuses && typeof parsed.statuses === 'object' ? parsed.statuses : {},
            history: Array.isArray(parsed.history) ? parsed.history : [],
            streak: parsed.streak && typeof parsed.streak === 'object'
                ? parsed.streak
                : { current: 0, longest: 0, lastActiveDate: null },
            activeSession: isValidActiveSession(parsed.activeSession) ? parsed.activeSession : null
        };
    } catch {
        return defaultState();
    }
}

export function savePersistedState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, ...state }));
    } catch {
        // Quota exceeded, storage disabled, private-mode throw, etc. -
        // silently no-op; the app keeps working in-memory for this session.
    }
}

// Today's date as a local YYYY-MM-DD string. Streaks/history only care
// about calendar days, not timestamps - this sidesteps timezone-conversion
// bugs when comparing "was that today or yesterday."
function todayString() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isYesterday(dateString, today) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const pad = (n) => String(n).padStart(2, '0');
    const yesterdayString = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
    return dateString === yesterdayString;
}

// Pure function: given the current persisted state and a just-completed
// test's score, returns a NEW persisted state with history appended (and
// capped) and the streak recomputed. Kept separate from the try/catch I/O
// wrappers above so the streak math itself stays easy to reason about.
export function recordTestCompletion(persisted, { correct, total }) {
    const today = todayString();
    const history = [...persisted.history, { date: today, correct, total }].slice(-HISTORY_LIMIT);

    const { current, longest, lastActiveDate } = persisted.streak;
    let newCurrent;
    if (lastActiveDate === today) {
        newCurrent = current;
    } else if (lastActiveDate && isYesterday(lastActiveDate, today)) {
        newCurrent = current + 1;
    } else {
        newCurrent = 1;
    }

    return {
        ...persisted,
        history,
        streak: {
            current: newCurrent,
            longest: Math.max(longest, newCurrent),
            lastActiveDate: today
        }
    };
}
