import { eyeIcon } from '../utils/vocabIcons.js';

// Only the Definitions/Sentences visibility toggles live here now - they
// affect the loop's cards directly, unlike the pos/status filters (moved
// into AllWordsDrawer.js, since those only matter while browsing/curating,
// not on the main practice screen).
export function createToolbar(state) {
    const toolbar = document.createElement('div');
    toolbar.className = "flex items-center gap-3 pb-2";
    toolbar.innerHTML = `
        <button id="toggle-def-btn" title="${state.showDef && !state.showSentence ? 'Show sentences to hide definitions' : ''}" class="flex items-center space-x-1.5 bg-stone-100 px-4 py-2.5 rounded-full hover:bg-[#DADAD3] transition select-none cursor-pointer text-[#333333] font-medium ${!state.showDef ? 'opacity-50' : ''}">
            <span>${eyeIcon(state.showDef, 'w-4 h-4 text-[#111111]')}</span>
            <span>Definitions</span>
        </button>
        <button id="toggle-sentence-btn" title="${state.showSentence && !state.showDef ? 'Show definitions to hide sentences' : ''}" class="flex items-center space-x-1.5 bg-stone-100 px-4 py-2.5 rounded-full hover:bg-[#DADAD3] transition select-none cursor-pointer text-[#333333] font-medium ${!state.showSentence ? 'opacity-50' : ''}">
            <span>${eyeIcon(state.showSentence, 'w-4 h-4 text-[#111111]')}</span>
            <span>Sentences</span>
        </button>
    `;
    return toolbar;
}
