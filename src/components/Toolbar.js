export function createToolbar(state, counts, testProgress = null) {
    const filtersDisabled = !!testProgress;
    const filtersDisabledAttrs = filtersDisabled
        ? `disabled title="Filters are locked during a test - exit or finish the test to change them"`
        : '';
    const filtersDisabledClasses = filtersDisabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:bg-gray-50 cursor-pointer';

    const toolbar = document.createElement('div');
    toolbar.className = "flex flex-wrap items-center justify-between gap-4 pb-2";
    toolbar.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 text-sm">
            <!-- Custom Part of Speech Dropdown -->
            <div class="relative" id="pos-dropdown-container">
                <button id="pos-menu-btn" ${filtersDisabledAttrs} class="bg-white px-3.5 py-2 rounded-lg border border-[#E1E1E1] text-[#333333] text-xs font-medium flex items-center space-x-3 transition shadow-xs select-none ${filtersDisabledClasses}">
                    <span id="pos-selected-label">${formatPosLabel(state.pos)}</span>
                    <svg class="w-3.5 h-3.5 text-[#767676] transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div id="pos-menu-list" class="hidden absolute left-0 mt-1 w-52 bg-white border border-[#E1E1E1] rounded-lg shadow-xl z-20 py-1 text-xs">
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer font-medium flex items-center justify-between" data-value="all">
                        <span class="flex items-center space-x-2">
                            <svg class="w-3.5 h-3.5 text-[#767676]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                            <span>All Parts of Speech</span>
                        </span>
                        <span class="text-gray-400 font-normal">${counts.pos.all}</span>
                    </div>
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between" data-value="noun">
                        <span class="flex items-center space-x-2">
                            <span class="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 rounded">n</span>
                            <span>Noun</span>
                        </span>
                        <span class="text-gray-400">${counts.pos.noun}</span>
                    </div>
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between" data-value="verb">
                        <span class="flex items-center space-x-2">
                            <span class="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 rounded">v</span>
                            <span>Verb</span>
                        </span>
                        <span class="text-gray-400">${counts.pos.verb}</span>
                    </div>
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between" data-value="adj">
                        <span class="flex items-center space-x-2">
                            <span class="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 rounded">adj</span>
                            <span>Adjective</span>
                        </span>
                        <span class="text-gray-400">${counts.pos.adj}</span>
                    </div>
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between" data-value="adv">
                        <span class="flex items-center space-x-2">
                            <span class="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 rounded">adv</span>
                            <span>Adverb</span>
                        </span>
                        <span class="text-gray-400">${counts.pos.adv}</span>
                    </div>
                </div>
            </div>

            <!-- Custom Status Dropdown -->
            <div class="relative" id="status-dropdown-container">
                <button id="status-menu-btn" ${filtersDisabledAttrs} class="bg-white px-3.5 py-2 rounded-lg border border-[#E1E1E1] text-[#333333] text-xs font-medium flex items-center space-x-3 transition shadow-xs select-none ${filtersDisabledClasses}">
                    <span id="status-selected-label">${formatStatusLabel(state.status)}</span>
                    <svg class="w-3.5 h-3.5 text-[#767676] transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div id="status-menu-list" class="hidden absolute left-0 mt-1 w-48 bg-white border border-[#E1E1E1] rounded-lg shadow-xl z-20 py-1 text-xs">
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer font-medium flex items-center justify-between" data-value="all">
                        <span class="flex items-center space-x-2">
                            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                            <span>All Statuses</span>
                        </span>
                        <span class="text-gray-400 font-normal">${counts.status.all}</span>
                    </div>
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between" data-value="Unseen">
                        <span class="flex items-center space-x-2">
                            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 110-18 9 9 0 010 18zm0-13v4m0 4h.01"/></svg>
                            <span>Unseen</span>
                        </span>
                        <span class="text-gray-400">${counts.status.Unseen}</span>
                    </div>
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between" data-value="Learning">
                        <span class="flex items-center space-x-2">
                            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <span>Learning</span>
                        </span>
                        <span class="text-gray-400">${counts.status.Learning}</span>
                    </div>
                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between" data-value="Mastered">
                        <span class="flex items-center space-x-2">
                            <svg class="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            <span>Mastered</span>
                        </span>
                        <span class="text-gray-400">${counts.status.Mastered}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex items-center space-x-3 text-xs text-[#767676]">
            <button id="test-mode-btn" title="${testProgress ? 'Click to exit test' : 'Start a test'}" class="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition select-none cursor-pointer font-medium shadow-xs ${testProgress
                ? 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
                : 'bg-[#111111] text-white hover:bg-black'}">
                ${testProgress
                    ? `<span class="relative flex h-2 w-2">
                           <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                           <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                       </span>`
                    : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`}
                <span>${testProgress && !testProgress.complete ? `Test Ongoing &middot; ${testProgress.resolved}/${testProgress.total}` : testProgress ? 'Test Ongoing' : 'Test Mode'}</span>
            </button>
            <button id="toggle-def-btn" title="${state.showDef && !state.showSentence ? 'Show sentences to hide definitions' : ''}" class="flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-lg border border-[#E1E1E1] hover:bg-gray-50 transition select-none cursor-pointer text-[#333333] font-medium shadow-xs ${!state.showDef ? 'opacity-50' : ''}">
                <span>
                    <svg class="w-4 h-4 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </span>
                <span>Definitions</span>
            </button>
            <button id="toggle-sentence-btn" title="${state.showSentence && !state.showDef ? 'Show definitions to hide sentences' : ''}" class="flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-lg border border-[#E1E1E1] hover:bg-gray-50 transition select-none cursor-pointer text-[#333333] font-medium shadow-xs ${!state.showSentence ? 'opacity-50' : ''}">
                <span>
                    <svg class="w-4 h-4 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </span>
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