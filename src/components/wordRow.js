import { posBadge, statusIcon as statusIconSvg } from '../utils/vocabIcons.js';

// Pinterest-style: color fill does the separating, not a border - so
// status progression reads as "the card gets bolder as you learn the
// word" (quiet white -> noticeable amber -> vivid green) instead of a
// uniform outline everywhere. Unseen still needs a thin edge since a
// white card on a white page would otherwise disappear entirely.
const CARD_STATUS_STYLE = {
    Unseen: 'bg-white border border-stone-200',
    Learning: 'bg-amber-100 border-0',
    Mastered: 'bg-green-200 border-0'
};

export function createWordRow(item, showDef, showSentence, onAudioPlay, onStatusToggle) {
    const row = document.createElement('div');
    row.className = `p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-8 rounded-2xl transition-colors duration-200 ${CARD_STATUS_STYLE[item.status]}`;

    const STATUS_META = {
        Unseen: { title: 'Status: Unseen (Click to change)', color: 'text-stone-400 hover:text-stone-600' },
        Learning: { title: 'Status: Learning (Click to change)', color: 'text-amber-600 hover:text-amber-700' },
        Mastered: { title: 'Status: Mastered (Click to change)', color: 'text-green-600 hover:text-green-700' }
    };
    const { title: statusTitle, color: statusColor } = STATUS_META[item.status];
    // No color class in the icon itself - it inherits currentColor from the
    // button below, so the hover shade change actually reaches the icon.
    const statusIcon = statusIconSvg(item.status, 'w-6 h-6');

    row.innerHTML = `
        <div class="md:col-span-3 flex items-center">
            <button data-action="audio" data-word="${item.word}" title="Pronounce Word" class="text-[#767676] hover:text-[#222222] rounded-full hover:bg-black/5 transition cursor-pointer p-1.5 mr-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
            </button>
            <h3 class="font-serif-gr font-bold text-base text-[#222222]">${item.word}</h3>
            <span class="ml-3">${posBadge(item.pos)}</span>
        </div>
        <div class="md:col-span-3 text-sm">
            <p class="text-sm text-[#333333] ${showDef ? '' : 'blur-sm select-none'} transition-all duration-200">${item.definition}</p>
        </div>
        <div class="md:col-span-5 text-sm">
            <p class="text-sm italic opacity-70 ${showSentence ? '' : 'blur-sm select-none'} transition-all duration-200">${item.sentence}</p>
        </div>
        <div class="md:col-span-1 flex justify-end">
            <button data-action="status" data-id="${item.id}" title="${statusTitle}" class="p-2 rounded-full hover:bg-black/5 transition cursor-pointer ${statusColor}">
                ${statusIcon}
            </button>
        </div>
    `;

    row.querySelector('[data-action="audio"]')?.addEventListener('click', () => onAudioPlay(item.word));
    row.querySelector('[data-action="status"]')?.addEventListener('click', () => onStatusToggle(item.id));

    return row;
}