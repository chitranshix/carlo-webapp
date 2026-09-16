import { allIcon, closeIcon } from '../utils/vocabIcons.js';

export function createHeader(masteredCount, totalCount, searchValue, streakCount = 0, allWordsOpen = false, learningCount = 0) {
    const header = document.createElement('header');
    header.className = "bg-[#DADAD3] sticky top-0 z-30";

    const masteredPct = (masteredCount / totalCount) * 100;
    const learningPct = (learningCount / totalCount) * 100;
    const unseenCount = totalCount - masteredCount - learningCount;

    header.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <h1 class="font-logo text-2xl text-[#111111] tracking-wide pt-1">Carlo</h1>

            <div class="flex items-center space-x-4">
                <div class="relative w-52 sm:w-64">
                    <input type="text" id="search-input" value="${searchValue}" placeholder="Search words, definitions..."
                        class="w-full pl-3.5 pr-8 py-2 bg-white border border-transparent rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition shadow-xs">
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#767676] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                ${streakCount > 0 ? `
                <div class="text-xs text-[#767676] hidden sm:block">
                    <span class="font-semibold text-[#111111]">${streakCount}</span> day streak
                </div>
                ` : ''}
                <!-- Rightmost element in the bar - toggles the All Words
                     drawer open/closed. The loop keeps running underneath
                     either way, so this never needs to confirm anything. -->
                <button id="header-all-words-btn" title="${allWordsOpen ? 'Close All Words' : 'View all words'}" class="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-full transition select-none cursor-pointer font-medium text-xs bg-stone-100 text-[#333333] hover:bg-[#DADAD3]">
                    ${allWordsOpen ? closeIcon('w-3.5 h-3.5') : allIcon('w-3.5 h-3.5')}
                    <span>All Words</span>
                </button>
            </div>
        </div>
        <!-- Sticks to the header's bottom edge, full width - lime (Mastered)
             then amber (Learning) fill left to right, against a track
             standing in for the rest (Unseen). The track is a shade darker
             than the header background above it (which is also #DADAD3) so
             it actually reads as a bar rather than blending into the header.
             Each segment gets its own custom tooltip (a plain 'title'
             attribute was tried first, but native tooltips are both slow -
             ~1s+ browser-imposed delay, nothing CSS can fix - and visually
             a generic OS box that clashes with the app's own styling).
             This one is styled like the toast (bg-[#111111]/white/rounded-lg)
             and appears instantly via CSS :hover, no JS or delay. -->
        <div class="h-2 w-full bg-stone-300 flex">
            <div class="h-full bg-lime-500 relative group" style="width: ${masteredPct}%">
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-[#111111] text-white text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none z-10">${masteredCount} word${masteredCount === 1 ? '' : 's'} mastered</div>
            </div>
            <div class="h-full bg-amber-400 relative group" style="width: ${learningPct}%">
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-[#111111] text-white text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none z-10">${learningCount} word${learningCount === 1 ? '' : 's'} learning</div>
            </div>
            <div class="h-full flex-1 relative group">
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-[#111111] text-white text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none z-10">${unseenCount} word${unseenCount === 1 ? '' : 's'} not started yet</div>
            </div>
        </div>
    `;
    return header;
}