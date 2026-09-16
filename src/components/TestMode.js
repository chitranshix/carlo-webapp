import { isSessionComplete, getScore, statusForResult } from '../services/testService.js';
import { posBadge, statusIcon } from '../utils/vocabIcons.js';

const STATUS_META = {
    Unseen: { label: 'Unseen', color: 'text-stone-400', icon: statusIcon('Unseen', 'w-4 h-4 text-stone-400') },
    Learning: { label: 'Learning', color: 'text-amber-600', icon: statusIcon('Learning', 'w-4 h-4 text-amber-600') },
    Mastered: { label: 'Mastered', color: 'text-lime-600', icon: statusIcon('Mastered', 'w-4 h-4 text-lime-600') }
};

/**
 * Renders Test Mode content meant to be dropped straight into the app's
 * existing <main> container, in place of the toolbar/divider/word-list.
 * The page header above it is untouched.
 */
export function createTestContent(session, callbacks) {
    const wrap = document.createElement('div');

    const complete = isSessionComplete(session);
    wrap.appendChild(complete ? renderResults(session) : renderMatching(session, callbacks));

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
    // The two columns aren't equal width - even a long word (~16 chars)
    // plus its pos badge and audio icon only needs ~250px, so the word
    // column can stay narrow (1fr) while the definition/sentence card,
    // which carries far more text and wraps to multiple lines, gets twice
    // the space (2fr) to cut down on wrapping.
    // Always 2 columns, even on mobile - this is a matching game, so words
    // and definitions both need to be visible at once to compare against
    // each other. Collapsing to a single column (word0, card0, word1,
    // card1... stacked) either misleads (looks like matched pairs) or,
    // when reordered to avoid that, forces scrolling back and forth to
    // compare - narrower columns are the right tradeoff, not one column.
    wrap.className = "grid grid-cols-[1fr_2fr] gap-x-3 sm:gap-x-6 gap-y-2";

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
    tile.className = `w-full text-left px-3 py-3 sm:px-5 sm:py-4 rounded-2xl border transition select-none flex items-center justify-between gap-2 ${classes}`;
    tile.innerHTML = `
        <span class="flex items-center min-w-0">
            <span class="font-serif-gr font-bold text-sm truncate">${item.word}</span>
            <span class="ml-3">${posBadge(item.pos)}</span>
        </span>
        <button type="button" data-action="audio" title="Pronounce Word" class="shrink-0 p-1.5 rounded-full hover:bg-black/5 transition cursor-pointer">
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
    tile.className = `w-full text-left px-3 py-3 sm:px-5 sm:py-4 rounded-2xl border transition select-none ${classes}`;
    tile.innerHTML = `
        <p class="text-sm ${showDef ? '' : 'blur-sm select-none'} transition-all duration-200">${item.definition}</p>
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
        // Fill carries the meaning now, not a border - a bolder lime fill
        // reads as "resolved and correct" without needing an outline.
        return { classes: 'bg-lime-200 border-0 text-lime-800 cursor-default', locked: true };
    }
    if (result === 'wrong') {
        // rose, not red - a themed status color like the lime above, not
        // the destructive-action red used for "Discard & exit" below.
        return { classes: 'bg-rose-200 border-0 text-rose-700 cursor-default', locked: true };
    }
    if (result === 'skipped') {
        return { classes: 'bg-stone-50 border-0 text-stone-400 cursor-default opacity-70', locked: true };
    }
    if (selected) {
        return { classes: 'bg-white border-[#111111] ring-2 ring-[#111111] text-[#111111] cursor-pointer', locked: false };
    }
    // The one tile state that still needs a real (thin) border - it's
    // white on a white page, so it needs some edge to read as a card at
    // all, the same reasoning as the browse list's Unseen cards.
    return { classes: 'bg-white border border-[#DADAD3] text-[#333333] hover:bg-stone-50 cursor-pointer shadow-xs', locked: false };
}

function renderResults(session) {
    const { correct, total } = getScore(session);

    const wrap = document.createElement('div');
    wrap.className = "max-w-lg mx-auto pt-2";

    wrap.innerHTML = `
        <div class="text-center mb-6">
            <p class="text-xs uppercase tracking-wide text-[#767676] font-medium">Round complete</p>
            <p class="font-serif-gr font-bold text-3xl text-[#111111] mt-1">${correct} / ${total}</p>
        </div>
        <div id="test-results-list" class="divide-y divide-[#DADAD3] border-t border-b border-[#DADAD3]"></div>
        <p class="text-xs text-center text-[#767676] mt-4">Next round starting...</p>
    `;

    const list = wrap.querySelector('#test-results-list');
    session.items.forEach(item => {
        const result = session.results[item.id];
        const newStatus = statusForResult(result, item.originalStatus);
        list.appendChild(renderResultRow(item, result, item.originalStatus, newStatus));
    });

    return wrap;
}

function renderResultRow(item, result, oldStatus, newStatus) {
    const row = document.createElement('div');
    row.className = "py-3 flex items-center justify-between gap-4";

    const changed = oldStatus !== newStatus;
    const resultLabel = result === 'correct' ? 'Correct' : result === 'wrong' ? 'Missed' : 'Skipped';
    const resultColor = result === 'correct' ? 'text-lime-600' : result === 'wrong' ? 'text-rose-500' : 'text-stone-400';

    row.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
            <span class="font-serif-gr font-bold text-sm text-[#222222] truncate">${item.word}</span>
            <span class="text-xs ${resultColor} font-medium shrink-0">${resultLabel}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
            ${STATUS_META[oldStatus].icon}
            ${changed ? '<svg class="w-3.5 h-3.5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>' + STATUS_META[newStatus].icon : ''}
        </div>
    `;
    return row;
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