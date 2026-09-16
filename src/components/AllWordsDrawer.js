import { closeIcon } from '../utils/vocabIcons.js';
import { createWordRow } from './wordRow.js';

// A slide-over panel, not a separate screen - the practice loop underneath
// is never torn down while this is open, so there's nothing to confirm or
// lose by opening/closing it. No open/close animation yet - deliberately
// kept out of this pass, easy to layer on later.
export function createAllWordsDrawer(items, showDef, showSentence, onAudioPlay, onStatusToggle, onClose) {
    const wrap = document.createElement('div');
    wrap.className = "fixed inset-0 z-40";

    const backdrop = document.createElement('div');
    backdrop.className = "absolute inset-0 bg-black/30";
    backdrop.addEventListener('click', onClose);
    wrap.appendChild(backdrop);

    const panel = document.createElement('div');
    panel.className = "absolute inset-y-0 left-0 w-full max-w-lg bg-white shadow-2xl overflow-y-auto";
    panel.innerHTML = `
        <div class="sticky top-0 bg-white border-b border-[#DADAD3] px-5 py-4 flex items-center justify-between z-10">
            <h2 class="font-serif-gr font-bold text-lg text-[#111111]">All Words</h2>
            <button id="drawer-close-btn" title="Close" class="p-2 rounded-full hover:bg-black/5 transition cursor-pointer text-[#767676] hover:text-[#111111]">
                ${closeIcon('w-5 h-5')}
            </button>
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
