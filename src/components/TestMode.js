import { isSessionComplete, getScore, statusForResult } from '../services/testService.js';

const STATUS_META = {
    Unseen: { label: 'Unseen', color: 'text-gray-400', icon: unseenIcon() },
    Learning: { label: 'Learning', color: 'text-amber-600', icon: learningIcon() },
    Mastered: { label: 'Mastered', color: 'text-green-600', icon: masteredIcon() }
};

/**
 * Renders Test Mode content meant to be dropped straight into the app's
 * existing <main> container, in place of the toolbar/divider/word-list.
 * The page header above it is untouched.
 */
export function createTestContent(session, callbacks) {
    const wrap = document.createElement('div');

    const complete = isSessionComplete(session);
    wrap.appendChild(complete ? renderResults(session, callbacks) : renderMatching(session, callbacks));

    if (session.confirmingExit) {
        wrap.appendChild(renderExitConfirm(callbacks));
    }

    return wrap;
}

function renderMatching(session, callbacks) {
    const wrap = document.createElement('div');
    wrap.className = "grid grid-cols-1 sm:grid-cols-2 gap-6";
    wrap.innerHTML = `
        <div id="test-word-col" class="space-y-2"></div>
        <div id="test-card-col" class="space-y-2"></div>
    `;

    const wordCol = wrap.querySelector('#test-word-col');
    const cardCol = wrap.querySelector('#test-card-col');

    session.wordOrder.forEach(id => {
        wordCol.appendChild(renderWordTile(findItem(session, id), session, callbacks));
    });

    session.cardOrder.forEach(id => {
        cardCol.appendChild(renderCardTile(findItem(session, id), session, callbacks));
    });

    return wrap;
}

function renderWordTile(item, session, callbacks) {
    const { classes, locked } = tileVisualState(session, 'word', item.id);
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.disabled = locked;
    tile.className = `w-full text-left px-4 py-3 rounded-lg border transition select-none ${classes}`;
    tile.innerHTML = `
        <span class="font-serif-gr font-bold text-sm">${item.word}</span>
        <span class="text-xs font-sans italic ml-1.5 opacity-70">(${item.pos})</span>
    `;
    if (!locked) {
        tile.addEventListener('click', () => callbacks.onTileClick('word', item.id));
    }
    return tile;
}

function renderCardTile(item, session, callbacks) {
    const { classes, locked } = tileVisualState(session, 'card', item.id);
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.disabled = locked;
    tile.className = `w-full text-left px-4 py-3 rounded-lg border transition select-none ${classes}`;
    tile.innerHTML = `
        <p class="text-sm">${item.definition}</p>
        <p class="text-xs italic mt-1 opacity-70">${item.sentence || ''}</p>
    `;
    if (!locked) {
        tile.addEventListener('click', () => callbacks.onTileClick('card', item.id));
    }
    return tile;
}

function tileVisualState(session, side, id) {
    const result = session.results[id];
    const selected = session.selected && session.selected.side === side && session.selected.id === id;

    if (result === 'correct') {
        return { classes: 'bg-green-50 border-green-300 text-green-700 cursor-default', locked: true };
    }
    if (result === 'wrong') {
        return { classes: 'bg-red-50 border-red-200 text-red-500 cursor-default opacity-80', locked: true };
    }
    if (result === 'skipped') {
        return { classes: 'bg-gray-50 border-gray-200 text-gray-400 cursor-default opacity-70', locked: true };
    }
    if (selected) {
        return { classes: 'bg-white border-[#111111] ring-2 ring-[#111111] text-[#111111] cursor-pointer', locked: false };
    }
    return { classes: 'bg-white border-[#E1E1E1] text-[#333333] hover:bg-gray-50 cursor-pointer shadow-xs', locked: false };
}

function renderResults(session, callbacks) {
    const { correct, total } = getScore(session);

    const wrap = document.createElement('div');
    wrap.className = "max-w-lg mx-auto pt-2";

    wrap.innerHTML = `
        <div class="text-center mb-6">
            <p class="text-xs uppercase tracking-wide text-[#767676] font-medium">Test complete</p>
            <p class="font-serif-gr font-bold text-3xl text-[#111111] mt-1">${correct} / ${total}</p>
        </div>
        <div id="test-results-list" class="divide-y divide-[#E1E1E1] border-t border-b border-[#E1E1E1] mb-6"></div>
        <div class="flex items-center justify-center gap-3">
            <button id="test-retry-btn" class="px-4 py-2 rounded-lg border border-[#E1E1E1] text-sm font-medium text-[#333333] hover:bg-gray-50 transition cursor-pointer">Test again</button>
            <button id="test-done-btn" class="px-4 py-2 rounded-lg bg-[#111111] text-white text-sm font-medium hover:bg-black transition cursor-pointer">Done</button>
        </div>
    `;

    const list = wrap.querySelector('#test-results-list');
    session.items.forEach(item => {
        const result = session.results[item.id];
        const newStatus = statusForResult(result, item.originalStatus);
        list.appendChild(renderResultRow(item, result, item.originalStatus, newStatus));
    });

    wrap.querySelector('#test-retry-btn')?.addEventListener('click', callbacks.onRetry);
    wrap.querySelector('#test-done-btn')?.addEventListener('click', callbacks.onDone);

    return wrap;
}

function renderResultRow(item, result, oldStatus, newStatus) {
    const row = document.createElement('div');
    row.className = "py-3 flex items-center justify-between gap-4";

    const changed = oldStatus !== newStatus;
    const resultLabel = result === 'correct' ? 'Correct' : result === 'wrong' ? 'Missed' : 'Skipped';
    const resultColor = result === 'correct' ? 'text-green-600' : result === 'wrong' ? 'text-red-500' : 'text-gray-400';

    row.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
            <span class="font-serif-gr font-bold text-sm text-[#222222] truncate">${item.word}</span>
            <span class="text-xs ${resultColor} font-medium shrink-0">${resultLabel}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
            ${STATUS_META[oldStatus].icon}
            ${changed ? '<svg class="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>' + STATUS_META[newStatus].icon : ''}
        </div>
    `;
    return row;
}

// The one intentional overlay left: a small blocking confirmation before a
// destructive action (discarding progress).
function renderExitConfirm(callbacks) {
    const wrap = document.createElement('div');
    wrap.className = "fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4";
    wrap.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <p class="font-serif-gr font-bold text-base text-[#111111] mb-1.5">End test now?</p>
            <p class="text-sm text-[#767676] mb-5">Your progress on this test won't be saved.</p>
            <div class="flex justify-end gap-2">
                <button id="test-cancel-discard-btn" class="px-3.5 py-2 rounded-lg text-sm font-medium text-[#333333] hover:bg-gray-100 transition cursor-pointer">Cancel</button>
                <button id="test-confirm-discard-btn" class="px-3.5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition cursor-pointer">Discard &amp; exit</button>
            </div>
        </div>
    `;
    wrap.querySelector('#test-cancel-discard-btn')?.addEventListener('click', callbacks.onCancelDiscard);
    wrap.querySelector('#test-confirm-discard-btn')?.addEventListener('click', callbacks.onConfirmDiscard);
    return wrap;
}

function findItem(session, id) {
    return session.items.find(i => i.id === id);
}

function unseenIcon() {
    return `<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 110-18 9 9 0 010 18zm0-13v4m0 4h.01"/></svg>`;
}

function learningIcon() {
    return `<svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
}

function masteredIcon() {
    return `<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
}