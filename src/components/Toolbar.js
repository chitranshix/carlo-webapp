import { posBadge, allIcon, statusIcon, eyeIcon } from '../utils/vocabIcons.js';

export function createToolbar(state, counts, testProgress = null) {
    const filtersDisabled = !!testProgress;
    const filtersDisabledAttrs = filtersDisabled
        ? `disabled title="Filters are locked during a test - exit or finish the test to change them"`
        : '';

    // A filter button gets its own "active" chip color whenever it's
    // narrowed away from "all", so it's obvious at a glance which filters
    // are currently applied - not just visible in the (easy-to-miss) label
    // text. The locked-during-test dimming layers on top of whichever
    // color it already has, so you can still see what's active while it's
    // locked, just greyed down.
    // Pinterest-style filled chips instead of outlined buttons - the fill
    // color itself signals active/inactive, no border needed.
    const filterButtonClasses = (isActive) => {
        // A noticeably darker warm-neutral fill for "active" - enough
        // contrast against the default stone-100 chip to spot at a glance,
        // without going full solid black. That treatment is reserved for
        // the one true primary action (the Test Mode button); using it
        // here too made every filter toggle compete for the same visual
        // weight. Blue was ruled out earlier as the one cool-toned color
        // in an otherwise entirely warm palette.
        const colorClasses = isActive
            ? 'bg-stone-300 text-[#111111] font-semibold'
            : 'bg-stone-100 text-[#333333] font-medium';
        const interactionClasses = filtersDisabled
            ? 'opacity-50 cursor-not-allowed'
            : `${isActive ? 'hover:bg-stone-400' : 'hover:bg-[#DADAD3]'} cursor-pointer`;
        return `${colorClasses} ${interactionClasses}`;
    };
    const posBtnClasses = filterButtonClasses(state.pos !== 'all');
    const statusBtnClasses = filterButtonClasses(state.status !== 'all');

    // The filter button itself now shows the same icon as its selected
    // dropdown row (the "n / v / adj / adv" badge, or the status icon),
    // not just a text label - so it reads at a glance without opening it.
    const posButtonIcon = state.pos === 'all' ? allIcon('w-3.5 h-3.5') : posBadge(state.pos);
    const statusButtonIcon = statusIcon(state.status, 'w-3.5 h-3.5');

    const toolbar = document.createElement('div');
    toolbar.className = "flex flex-wrap items-center justify-between gap-4 pb-2";
    toolbar.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 text-sm">
            <!-- Custom Part of Speech Dropdown -->
            <div class="relative" id="pos-dropdown-container">
                <button id="pos-menu-btn" ${filtersDisabledAttrs} class="px-4 py-2.5 rounded-full text-xs flex items-center space-x-2 transition select-none ${posBtnClasses}">
                    ${posButtonIcon}
                    <span id="pos-selected-label">${formatPosLabel(state.pos)}</span>
                    <svg class="w-3.5 h-3.5 text-[#767676] transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div id="pos-menu-list" class="hidden absolute left-0 mt-1 w-52 bg-white border border-[#DADAD3] rounded-2xl shadow-xl z-20 py-1.5 text-xs overflow-hidden">
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer font-medium flex items-center justify-between" data-value="all">
                        <span class="flex items-center space-x-2">
                            ${allIcon('w-3.5 h-3.5 text-[#767676]')}
                            <span>All Parts of Speech</span>
                        </span>
                        <span class="text-stone-400 font-normal">${counts.pos.all}</span>
                    </div>
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer flex items-center justify-between" data-value="noun">
                        <span class="flex items-center space-x-2">
                            ${posBadge('noun')}
                            <span>Noun</span>
                        </span>
                        <span class="text-stone-400">${counts.pos.noun}</span>
                    </div>
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer flex items-center justify-between" data-value="verb">
                        <span class="flex items-center space-x-2">
                            ${posBadge('verb')}
                            <span>Verb</span>
                        </span>
                        <span class="text-stone-400">${counts.pos.verb}</span>
                    </div>
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer flex items-center justify-between" data-value="adj">
                        <span class="flex items-center space-x-2">
                            ${posBadge('adj')}
                            <span>Adjective</span>
                        </span>
                        <span class="text-stone-400">${counts.pos.adj}</span>
                    </div>
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer flex items-center justify-between" data-value="adv">
                        <span class="flex items-center space-x-2">
                            ${posBadge('adv')}
                            <span>Adverb</span>
                        </span>
                        <span class="text-stone-400">${counts.pos.adv}</span>
                    </div>
                </div>
            </div>

            <!-- Custom Status Dropdown -->
            <div class="relative" id="status-dropdown-container">
                <button id="status-menu-btn" ${filtersDisabledAttrs} class="px-4 py-2.5 rounded-full text-xs flex items-center space-x-2 transition select-none ${statusBtnClasses}">
                    ${statusButtonIcon}
                    <span id="status-selected-label">${formatStatusLabel(state.status)}</span>
                    <svg class="w-3.5 h-3.5 text-[#767676] transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div id="status-menu-list" class="hidden absolute left-0 mt-1 w-48 bg-white border border-[#DADAD3] rounded-2xl shadow-xl z-20 py-1.5 text-xs overflow-hidden">
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer font-medium flex items-center justify-between" data-value="all">
                        <span class="flex items-center space-x-2">
                            ${allIcon('w-3.5 h-3.5 text-stone-500')}
                            <span>All Statuses</span>
                        </span>
                        <span class="text-stone-400 font-normal">${counts.status.all}</span>
                    </div>
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer flex items-center justify-between" data-value="Unseen">
                        <span class="flex items-center space-x-2">
                            ${statusIcon('Unseen', 'w-3.5 h-3.5 text-stone-400')}
                            <span>Unseen</span>
                        </span>
                        <span class="text-stone-400">${counts.status.Unseen}</span>
                    </div>
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer flex items-center justify-between" data-value="Learning">
                        <span class="flex items-center space-x-2">
                            ${statusIcon('Learning', 'w-3.5 h-3.5 text-amber-600')}
                            <span>Learning</span>
                        </span>
                        <span class="text-stone-400">${counts.status.Learning}</span>
                    </div>
                    <div class="px-3.5 py-2.5 hover:bg-stone-100 cursor-pointer flex items-center justify-between" data-value="Mastered">
                        <span class="flex items-center space-x-2">
                            ${statusIcon('Mastered', 'w-3.5 h-3.5 text-lime-600')}
                            <span>Mastered</span>
                        </span>
                        <span class="text-stone-400">${counts.status.Mastered}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex items-center space-x-3 text-xs text-[#767676]">
            <button id="test-mode-btn" title="${testProgress ? 'Click to view all words' : 'Click to start a test'}" class="flex items-center space-x-1.5 px-4 py-2.5 rounded-full transition select-none cursor-pointer font-medium ${testProgress
                ? 'bg-stone-100 text-[#333333] hover:bg-[#DADAD3]'
                : 'bg-[#111111] text-white hover:bg-black'}">
                ${testProgress
                    ? allIcon('w-4 h-4')
                    : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`}
                <span>${testProgress ? 'All Words' : 'Test Mode'}</span>
            </button>
            <button id="toggle-def-btn" title="${state.showDef && !state.showSentence ? 'Show sentences to hide definitions' : ''}" class="flex items-center space-x-1.5 bg-stone-100 px-4 py-2.5 rounded-full hover:bg-[#DADAD3] transition select-none cursor-pointer text-[#333333] font-medium ${!state.showDef ? 'opacity-50' : ''}">
                <span>${eyeIcon(state.showDef, 'w-4 h-4 text-[#111111]')}</span>
                <span>Definitions</span>
            </button>
            <button id="toggle-sentence-btn" title="${state.showSentence && !state.showDef ? 'Show definitions to hide sentences' : ''}" class="flex items-center space-x-1.5 bg-stone-100 px-4 py-2.5 rounded-full hover:bg-[#DADAD3] transition select-none cursor-pointer text-[#333333] font-medium ${!state.showSentence ? 'opacity-50' : ''}">
                <span>${eyeIcon(state.showSentence, 'w-4 h-4 text-[#111111]')}</span>
                <span>Sentences</span>
            </button>
        </div>
    `;
    return toolbar;
}

function formatPosLabel(pos) {
    switch(pos) {
        case 'noun': return 'Noun';
        case 'verb': return 'Verb';
        case 'adj': return 'Adjective';
        case 'adv': return 'Adverb';
        default: return 'All Parts of Speech';
    }
}

function formatStatusLabel(status) {
    switch(status) {
        case 'Unseen': return 'Unseen';
        case 'Learning': return 'Learning';
        case 'Mastered': return 'Mastered';
        default: return 'All Statuses';
    }
}
