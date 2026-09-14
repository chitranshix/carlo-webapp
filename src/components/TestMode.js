import { isSessionComplete, getScore, statusForResult } from '../services/testService.js';
import { posBadge, statusIcon } from '../utils/vocabIcons.js';

const STATUS_META = {
    Unseen: { label: 'Unseen', color: 'text-gray-400', icon: statusIcon('Unseen', 'w-4 h-4 text-gray-400') },
    Learning: { label: 'Learning', color: 'text-amber-600', icon: statusIcon('Learning', 'w-4 h-4 text-amber-600') },
    Mastered: { label: 'Mastered', color: 'text-green-600', icon: statusIcon('Mastered', 'w-4 h-4 text-green-600') }
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
    // Word tile i and card tile i are placed in the same grid row (rather
    // than two separately-stacked columns), so each row's two cells get
    // the same height for free via CSS grid's default row stretch - no
    // manual height math needed. This is purely a visual pairing: wordOrder
    // and cardOrder are still shuffled independently, so which word sits
    // next to which card gives no hint about which ones actually match.
    wrap.className = "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2";

    session.wordOrder.forEach((wordId, i) => {
        const cardId = session.cardOrder[i];
        wrap.appendChild(renderWordTile(findItem(session, wordId), session, callbacks));
        wrap.appendChild(renderCardTile(findItem(session, cardId), session, callbacks));
    });

    return wrap;
}

function renderWordTile(item, session, callbacks) {
    const { classes, locked } = tileVisualState(session, 'word', item.id);
    // A plain <button> can't contain the audio button (nested buttons are
    // invalid HTML), so this is a div with its own click-to-select handling
    // - including the keyboard access a real button gets for free.
    const tile = document.createElement('div');
    tile.className = `w-full text-left px-4 py-3 rounded-lg border transition select-none flex items-center justify-between gap-2 ${classes}`;
    tile.innerHTML = `
        <span class="flex items-center min-w-0">
            <span class="font-serif-gr font-bold text-base truncate">${item.word}</span>
            <span class="ml-3">${posBadge(item.pos)}</span>
        </span>
        <button type="button" data-action="audio" title="Pronounce Word" class="shrink-0 p-1 rounded hover:bg-black/5 transition cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
        </button>
    `;

    // Pronunciation stays available even on a resolved tile - only the
    // "select this word for matching" behavior is locked once it's done.
    tile.querySelector('[data-action="audio"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacks.onAudioPlay?.(item.word);
    });

    if (!locked) {
        tile.setAttribute('role', 'button');
        tile.tabIndex = 0;
        tile.addEventListener('click', () => callbacks.onTileClick('word', item.id));
        tile.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                callbacks.onTileClick('word', item.id);
            }
        });
    }
    return tile;
}

function renderCardTile(item, session, callbacks) {
    const { classes, locked } = tileVisualState(session, 'card', item.id);
    // Definitions/Sentences toggles apply here too, same blur treatment as
    // the browse list. The toggle handlers already prevent turning both
    // off at once, but fall back to showing the definition just in case,
    // so a card is never left with nothing readable on it.
    let showDef = callbacks.showDef !== false;
    let showSentence = callbacks.showSentence !== false;
    if (!showDef && !showSentence) showDef = true;
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.disabled = locked;
    tile.className = `w-full text-left px-4 py-3 rounded-lg border transition select-none ${classes}`;
    tile.innerHTML = `
        <p class="text-base ${showDef ? '' : 'blur-sm select-none'} transition-all duration-200">${item.definition}</p>
        <p class="text-sm italic mt-2 opacity-70 ${showSentence ? '' : 'blur-sm select-none'} transition-all duration-200">${redactWord(item.word, item.sentence) || ''}</p>
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

// Sentences are written to illustrate the word, so the word (or an
// inflected form of it, e.g. "morose" -> "morosely") often appears right in
// the sentence - a free giveaway during a matching test. Blank out the
// word and anything glued onto the end of it, case-insensitively, wherever
// it starts a token; length isn't preserved (always "_____") so the blank
// itself doesn't leak how long the word is.
function redactWord(word, sentence) {
    if (!sentence || !word) return sentence;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escaped}\\w*`, 'gi');
    return sentence.replace(pattern, '_____');
}