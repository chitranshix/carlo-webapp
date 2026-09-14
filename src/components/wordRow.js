export function createWordRow(item, showDef, showSentence, onAudioPlay, onStatusToggle) {
    const row = document.createElement('div');
    row.className = "py-4 grid grid-cols-1 md:grid-cols-12 items-center gap-16 border-b border-[#E1E1E1] last:border-b-0";

    let statusIcon = '';
    let statusTitle = '';
    let statusColor = '';

    if (item.status === 'Unseen') {
        statusTitle = 'Status: Unseen (Click to change)';
        statusColor = 'text-gray-400 hover:text-gray-600';
        statusIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 110-18 9 9 0 010 18zm0-13v4m0 4h.01"/></svg>`;
    } else if (item.status === 'Learning') {
        statusTitle = 'Status: Learning (Click to change)';
        statusColor = 'text-amber-600 hover:text-amber-700';
        statusIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    } else {
        statusTitle = 'Status: Mastered (Click to change)';
        statusColor = 'text-green-600 hover:text-green-700';
        statusIcon = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
    }

    row.innerHTML = `
        <div class="md:col-span-3 flex items-center space-x-2">
            <h3 class="font-serif-gr font-bold text-base text-[#222222]">${item.word}</h3>
            <span class="text-xs font-sans text-[#767676] italic">(${item.pos})</span>
            <button data-action="audio" data-word="${item.word}" title="Pronounce Word" class="text-[#767676] hover:text-[#222222] transition cursor-pointer p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
            </button>
        </div>
        <div class="md:col-span-3 text-sm">
            <p class="text-[#767676] ${showDef ? '' : 'blur-sm select-none'} transition-all duration-200">${item.definition}</p>
        </div>
        <div class="md:col-span-5 text-sm">
            <p class="text-[#767676] italic ${showSentence ? '' : 'blur-sm select-none'} transition-all duration-200">${item.sentence}</p>
        </div>
        <div class="md:col-span-1 flex justify-end">
            <button data-action="status" data-id="${item.id}" title="${statusTitle}" class="p-1.5 rounded-md transition cursor-pointer ${statusColor}">
                ${statusIcon}
            </button>
        </div>
    `;

    row.querySelector('[data-action="audio"]')?.addEventListener('click', () => onAudioPlay(item.word));
    row.querySelector('[data-action="status"]')?.addEventListener('click', () => onStatusToggle(item.id));

    return row;
}