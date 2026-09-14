// Shared word-metadata badges/icons, so the same "n / v / adj / adv" part-of
// -speech abbreviation and the same Unseen/Learning/Mastered status icons
// look identical everywhere they appear (filter dropdowns, the browse list,
// Test Mode) instead of being redrawn slightly differently in each place.

export const POS_ABBREV = { noun: 'n', verb: 'v', adj: 'adj', adv: 'adv' };

// A small neutral chip, e.g. "n" / "adj" - always the same gray badge
// regardless of context, so it reads as one consistent piece of notation.
export function posBadge(pos, svgClasses = 'w-3.5 h-3.5') {
    const label = POS_ABBREV[pos] || pos;
    // inline-flex, not flex: flex is block-level and forces a line break
    // wherever this badge sits next to plain inline text (e.g. the Test
    // Mode word tile) rather than as a direct child of an already-flex
    // container (the toolbar buttons, the word-list row).
    return `<span class="${svgClasses} inline-flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 rounded">${label}</span>`;
}

// The "everything" hamburger icon used for All Parts of Speech / All
// Statuses / All Words. No color baked in (stroke="currentColor") so it
// picks up whatever text color the caller's wrapper already has.
export function allIcon(svgClasses = 'w-3.5 h-3.5') {
    return `<svg class="${svgClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`;
}

// Unseen/Learning/Mastered status icon. No color is baked in either - pass
// a color utility in svgClasses for a fixed-color display (dropdown items,
// Test Mode result rows), or omit it to let the icon inherit currentColor
// from a hoverable parent (the browse list's clickable status toggle).
export function statusIcon(status, svgClasses = 'w-3.5 h-3.5') {
    if (status === 'Unseen') {
        return `<svg class="${svgClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 110-18 9 9 0 010 18zm0-13v4m0 4h.01"/></svg>`;
    }
    if (status === 'Learning') {
        return `<svg class="${svgClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }
    if (status === 'Mastered') {
        return `<svg class="${svgClasses}" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
    }
    return allIcon(svgClasses); // 'all'
}

// Open/closed eye for the Definitions and Sentences visibility toggles.
export function eyeIcon(isOpen, svgClasses = 'w-4 h-4') {
    if (isOpen) {
        return `<svg class="${svgClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
    }
    return `<svg class="${svgClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>`;
}
