// Pure, DOM-free logic for Test Mode. Kept separate from rendering so the
// matching rules can be reasoned about (and unit tested) on their own.

export function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function pickRandomWords(vocabList, count = 4) {
    return shuffleArray(vocabList).slice(0, count);
}

/**
 * Creates a fresh test session: a batch of random words, with the word list
 * and the definition/sentence cards independently shuffled so LHS/RHS
 * positions don't line up.
 */
export function createTestSession(vocabList, count = 4) {
    const items = pickRandomWords(vocabList, count).map(item => ({
        id: item.id,
        word: item.word,
        pos: item.pos,
        definition: item.definition,
        sentence: item.sentence,
        originalStatus: item.status
    }));

    return {
        items,
        wordOrder: shuffleArray(items.map(i => i.id)),
        cardOrder: shuffleArray(items.map(i => i.id)),
        selected: null,       // { side: 'word' | 'card', id } - the tile awaiting a partner
        results: {}           // id -> 'correct' | 'wrong' | 'skipped'
    };
}

export function isSessionComplete(session) {
    return session.items.every(item => Object.prototype.hasOwnProperty.call(session.results, item.id));
}

export function getScore(session) {
    const correct = session.items.filter(i => session.results[i.id] === 'correct').length;
    return { correct, total: session.items.length };
}

// What a word's status becomes once the session is scored.
// - correct: the user matched it themselves -> Mastered
// - wrong: the user picked this word and matched it to the wrong card -> Learning
// - skipped: this word's card got taken by someone else's wrong guess; the
//   word itself was never attempted, so its status is left untouched
export function statusForResult(result, originalStatus) {
    if (result === 'correct') return 'Mastered';
    if (result === 'wrong') return 'Learning';
    return originalStatus;
}

/**
 * Handles a click on a word tile or a card tile and mutates the session's
 * `selected` / `results` in place.
 *
 * Rules:
 * - First click of a pair just selects that tile.
 * - Clicking the same side again swaps the selection.
 * - Clicking the opposite side evaluates the pair:
 *     - same id both sides -> correct match
 *     - different ids -> the WORD side is marked 'wrong' (it was the word
 *       being actively tested and failed), and the CARD side's true owner
 *       word is marked 'skipped' (its card got stolen; it was never itself
 *       attempted this round). Both tiles sharing an id lock together.
 * - Clicking an already-resolved tile is a no-op.
 */
export function handleTileClick(session, side, id) {
    if (Object.prototype.hasOwnProperty.call(session.results, id)) return;

    if (!session.selected) {
        session.selected = { side, id };
        return;
    }

    if (session.selected.side === side) {
        session.selected = { side, id };
        return;
    }

    const wordId = side === 'word' ? id : session.selected.id;
    const cardId = side === 'card' ? id : session.selected.id;
    session.selected = null;

    if (wordId === cardId) {
        session.results[wordId] = 'correct';
        return;
    }

    session.results[wordId] = 'wrong';
    session.results[cardId] = 'skipped';
}