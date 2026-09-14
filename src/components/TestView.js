export function createTestView(testItems, shuffledRHS, testResults, selectedWord, selectedRHS, onSelectWord, onSelectRHS, onExitTest) {
    const container = document.createElement('div');
    container.className = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6";

    container.innerHTML = `
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-serif font-bold text-[#222222]">Vocabulary Test Mode (7 Words)</h2>
            <button id="exit-test-btn" class="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition cursor-pointer">
                Exit Test
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- LHS: Words -->
            <div class="space-y-3">
                <h3 class="text-xs font-semibold text-[#767676] uppercase tracking-wider">Words</h3>
                <div class="space-y-2" id="test-words-container">
                    ${testItems.map(item => {
                        const isResolved = testResults[item.id];
                        const isSelected = selectedWord === item.id;
                        let stateClass = "border-gray-200 bg-white hover:border-gray-400 cursor-pointer";
                        if (isResolved === 'correct') stateClass = "border-green-500 bg-green-50 text-green-800 opacity-75 cursor-not-allowed";
                        if (isResolved === 'incorrect') stateClass = "border-amber-500 bg-amber-50 text-amber-800 opacity-75 cursor-not-allowed";
                        if (isSelected && !isResolved) stateClass = "border-black ring-2 ring-black bg-gray-50";

                        return `
                            <div data-id="${item.id}" class="test-word-card p-4 rounded-xl border ${stateClass} transition flex items-center justify-between">
                                <div>
                                    <span class="font-serif font-bold text-base text-[#222222]">${item.word}</span>
                                    <span class="text-xs text-[#767676] italic ml-2">(${item.pos})</span>
                                </div>
                                ${isResolved === 'correct' ? '<span class="text-green-600 font-bold text-sm">✓</span>' : ''}
                                ${isResolved === 'incorrect' ? '<span class="text-amber-600 font-bold text-sm">✗</span>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- RHS: Definition + Sentence Cards -->
            <div class="space-y-3">
                <h3 class="text-xs font-semibold text-[#767676] uppercase tracking-wider">Definitions & Sentences</h3>
                <div class="space-y-2" id="test-rhs-container">
                    ${shuffledRHS.map(card => {
                        const isResolved = testResults[card.id];
                        // Note: A card is resolved if its specific item ID has been answered, 
                        // but to keep it simple, we track completion by item.id match.
                        const isSelected = selectedRHS === card.id;
                        let stateClass = "border-gray-200 bg-white hover:border-gray-400 cursor-pointer";
                        
                        // Check if this card's specific ID has been resolved globally in testResults
                        const resolvedStatus = testResults[card.id];
                        if (resolvedStatus === 'correct') stateClass = "border-green-500 bg-green-50 text-green-800 opacity-75 cursor-not-allowed";
                        // If wrong, we can check if it was picked incorrectly or just leave matching generic styling
                        if (isSelected && !resolvedStatus) stateClass = "border-black ring-2 ring-black bg-gray-50";

                        return `
                            <div data-id="${card.id}" class="test-rhs-card p-4 rounded-xl border ${stateClass} transition space-y-1">
                                <p class="text-sm text-[#222222]">${card.definition}</p>
                                <p class="text-xs text-[#767676] italic">${card.sentence}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    // Event listeners
    container.querySelector('#exit-test-btn').addEventListener('click', onExitTest);

    container.querySelectorAll('.test-word-card').forEach(el => {
        el.addEventListener('click', () => {
            const id = Number(el.getAttribute('data-id'));
            if (!testResults[id]) onSelectWord(id);
        });
    });

    container.querySelectorAll('.test-rhs-card').forEach(el => {
        el.addEventListener('click', () => {
            const id = Number(el.getAttribute('data-id'));
            if (!testResults[id]) onSelectRHS(id);
        });
    });

    return container;
}