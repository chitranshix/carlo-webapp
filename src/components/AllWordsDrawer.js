import { posBadge, allIcon, statusIcon, closeIcon } from '../utils/vocabIcons.js';
import { createWordRow } from './wordRow.js';

// A slide-over panel, not a separate screen - the practice loop underneath
// is never torn down while this is open, so there's nothing to confirm or
// lose by opening/closing it. No open/close animation yet - deliberately
// kept out of this pass, easy to layer on later.
//
// pos/status filters live here (not in the main Toolbar) since they only
// matter while browsing/curating this list - the loop's own word-pool
// selection still reads the same `state.pos`/`state.status` values
// (see app.js's getTestPool()), just via controls relocated into this
// drawer rather than duplicated.
export function createAllWordsDrawer(items, state, counts, showDef, showSentence, onAudioPlay, onStatusToggle, onClose) {
    const wrap = document.createElement('div');
    wrap.className = "fixed inset-0 z-40";

    const backdrop = document.createElement('div');
    backdrop.className = "absolute inset-0 bg-black/30";
    backdrop.addEventListener('click', onClose);
    wrap.appendChild(backdrop);

    // Same "active filter gets a darker chip" treatment as the old toolbar.
    const filterButtonClasses = (isActive) => {
        const colorClasses = isActive
            ? 'bg-stone-300 text-[#111111] font-semibold'
            : 'bg-stone-100 text-[#333333] font-medium';
        const interactionClasses = isActive ? 'hover:bg-stone-400' : 'hover:bg-[#DADAD3]';
        return `${colorClasses} ${interactionClasses} cursor-pointer`;
    };
    const posBtnClasses = filterButtonClasses(state.pos !== 'all');
    const statusBtnClasses = filterButtonClasses(state.status !== 'all');
    const posButtonIcon = state.pos === 'all' ? allIcon('w-3.5 h-3.5') : posBadge(state.pos);
    const statusButtonIcon = statusIcon(state.status, 'w-3.5 h-3.5');

    const panel = document.createElement('div');
    // Right side, ~70% of the viewport on larger screens, full width on
    // mobile - opens over the loop rather than replacing it.
    panel.className = "absolute inset-y-0 right-0 w-full sm:w-[70%] bg-white shadow-2xl overflow-y-auto";
    panel.innerHTML = `
        <div class="sticky top-0 bg-white border-b border-[#DADAD3] z-10">
            <div class="px-5 py-4 flex items-center justify-between">
                <h2 class="font-serif-gr font-bold text-lg text-[#111111]">All Words</h2>
                <button id="drawer-close-btn" title="Close" class="p-2 rounded-full hover:bg-black/5 transition cursor-pointer text-[#767676] hover:text-[#111111]">
                    ${closeIcon('w-5 h-5')}
                </button>
            </div>
            <div class="px-5 pb-4 flex flex-wrap items-center gap-3 text-sm">
                <!-- Custom Part of Speech Dropdown -->
                <div class="relative" id="pos-dropdown-container">
                    <button id="pos-menu-btn" class="px-4 py-2.5 rounded-full text-xs flex items-center space-x-2 transition select-none ${posBtnClasses}">
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
                    <button id="status-menu-btn" class="px-4 py-2.5 rounded-full text-xs flex items-center space-x-2 transition select-none ${statusBtnClasses}">
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
        </div>
        <div id="drawer-word-list" class="p-5 space-y-4"></div>
    `;
    panel.querySelector('#drawer-close-btn')?.addEventListener('click', onClose);

    const list = panel.querySelector('#drawer-word-list');
    if (items.length === 0) {
        list.className = "";
        list.innerHTML = `<div class="p-12 text-center text-[#767676]"><p>No matching vocabulary words found.</p></div>`;
    } else {
        items.forEach(item => {
            const rowEl = createWordRow(item, showDef, showSentence, onAudioPlay, onStatusToggle);
            list.appendChild(rowEl);
        });
    }

    wrap.appendChild(panel);
    return wrap;
}

function formatPosLabel(pos) {
    switch (pos) {
        case 'noun': return 'Noun';
        case 'verb': return 'Verb';
        case 'adj': return 'Adjective';
        case 'adv': return 'Adverb';
        default: return 'All Parts of Speech';
    }
}

function formatStatusLabel(status) {
    switch (status) {
        case 'Unseen': return 'Unseen';
        case 'Learning': return 'Learning';
        case 'Mastered': return 'Mastered';
        default: return 'All Statuses';
    }
}
