export function createHeader(wordCount, searchValue) {
    const header = document.createElement('header');
    header.className = "bg-[#E9E9E9] sticky top-0 z-30";
    header.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <h1 class="font-logo text-2xl text-[#111111] tracking-wide pt-1">Carlo</h1>

            <div class="flex items-center space-x-4">
                <div class="relative w-52 sm:w-64">
                    <input type="text" id="search-input" value="${searchValue}" placeholder="Search words, definitions..."
                        class="w-full pl-3 pr-8 py-1.5 bg-white border border-transparent rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition shadow-xs">
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#767676] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <div class="text-xs text-[#767676] hidden sm:block">
                    <span id="word-count" class="font-semibold text-[#111111]">${wordCount}</span> words
                </div>
            </div>
        </div>
    `;
    return header;
}