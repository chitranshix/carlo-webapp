import { INITIAL_VOCAB_DATA } from './data/vocabData.js';
import { AudioService } from './services/audioService.js';
import { createTestSession, handleTileClick, isSessionComplete, statusForResult } from './services/testService.js';
import { createHeader } from './components/Header.js';
import { createToolbar } from './components/Toolbar.js';
import { createWordRow } from './components/wordRow.js';
import { createTestContent } from './components/TestMode.js';

class LexiconApp {
    constructor(rootElementId) {
        this.state = {
            search: "",
            pos: "all",
            status: "all",
            showDef: true,
            showSentence: true
        };
        
        this.vocabList = [...INITIAL_VOCAB_DATA];
        this.testSession = null;
        
        const root = document.getElementById(rootElementId);
        if (!root) throw new Error("Root element missing");
        this.container = root;
        
        this.initEventListeners();
        this.render();
    }

    handleStatusToggle = (id) => {
        const item = this.vocabList.find(w => w.id === id);
        if (!item) return;
        if (item.status === 'Unseen') item.status = 'Learning';
        else if (item.status === 'Learning') item.status = 'Mastered';
        else item.status = 'Unseen';
        this.render();
    }

    handleStartTest = () => {
        this.testSession = createTestSession(this.vocabList, 5);
        this.render();
    }

    handleRetryTest = () => {
        this.testSession = createTestSession(this.vocabList, 5);
        this.render();
    }

    handleTestTileClick = (side, id) => {
        if (!this.testSession) return;
        handleTileClick(this.testSession, side, id);
        if (isSessionComplete(this.testSession)) {
            this.applyTestResults();
        }
        this.render();
    }

    applyTestResults() {
        this.testSession.items.forEach(item => {
            const result = this.testSession.results[item.id];
            const newStatus = statusForResult(result, item.originalStatus);
            const vocabItem = this.vocabList.find(v => v.id === item.id);
            if (vocabItem) vocabItem.status = newStatus;
        });
    }

    handleRequestCloseTest = () => {
        if (!this.testSession) return;
        if (isSessionComplete(this.testSession)) {
            // Results are already applied to vocabList - just close.
            this.testSession = null;
        } else {
            this.testSession.confirmingExit = true;
        }
        this.render();
    }

    handleCancelDiscardTest = () => {
        if (!this.testSession) return;
        this.testSession.confirmingExit = false;
        this.render();
    }

    handleConfirmDiscardTest = () => {
        this.testSession = null;
        this.render();
    }

    getCounts() {
        const baseSearchFiltered = this.vocabList.filter(item => 
            item.word.toLowerCase().includes(this.state.search.toLowerCase()) || 
            item.definition.toLowerCase().includes(this.state.search.toLowerCase())
        );

        return {
            pos: {
                all: baseSearchFiltered.length,
                noun: baseSearchFiltered.filter(i => i.pos === 'noun').length,
                verb: baseSearchFiltered.filter(i => i.pos === 'verb').length,
                adj: baseSearchFiltered.filter(i => i.pos === 'adj').length,
                adv: baseSearchFiltered.filter(i => i.pos === 'adv').length,
            },
            status: {
                all: baseSearchFiltered.length,
                Unseen: baseSearchFiltered.filter(i => i.status === 'Unseen').length,
                Learning: baseSearchFiltered.filter(i => i.status === 'Learning').length,
                Mastered: baseSearchFiltered.filter(i => i.status === 'Mastered').length,
            }
        };
    }

    getFilteredData() {
        return this.vocabList.filter(item => {
            const matchesSearch = item.word.toLowerCase().includes(this.state.search.toLowerCase()) || 
                                  item.definition.toLowerCase().includes(this.state.search.toLowerCase());
            const matchesPos = this.state.pos === 'all' || item.pos === this.state.pos;
            const matchesStatus = this.state.status === 'all' || item.status === this.state.status;
            return matchesSearch && matchesPos && matchesStatus;
        });
    }

    initEventListeners() {
        document.addEventListener('click', () => {
            document.getElementById('pos-menu-list')?.classList.add('hidden');
            document.getElementById('status-menu-list')?.classList.add('hidden');
        });
    }

    render() {
        const filtered = this.getFilteredData();
        const counts = this.getCounts();

        this.container.innerHTML = '';
        this.container.className = "min-h-screen flex flex-col bg-white text-[#333333]";

        // Header
        const headerEl = createHeader(filtered.length, this.state.search);
        this.container.appendChild(headerEl);

        const searchInput = headerEl.querySelector('#search-input');
        searchInput?.addEventListener('input', (e) => {
            this.state.search = e.target.value;
            this.render();
        });

        // Main Landmark Container
        const main = document.createElement('main');
        main.className = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 flex-grow w-full space-y-4";

        // Toolbar Component (always shown, including during Test Mode)
        const testProgress = this.testSession
            ? { resolved: Object.keys(this.testSession.results).length, total: this.testSession.items.length, complete: isSessionComplete(this.testSession) }
            : null;
        const toolbarEl = createToolbar(this.state, counts, testProgress);
        main.appendChild(toolbarEl);

        // Toolbar interactivity bindings
        const posBtn = toolbarEl.querySelector('#pos-menu-btn');
        const posList = toolbarEl.querySelector('#pos-menu-list');
        const statusBtn = toolbarEl.querySelector('#status-menu-btn');
        const statusList = toolbarEl.querySelector('#status-menu-list');

        posBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            statusList.classList.add('hidden');
            posList.classList.toggle('hidden');
        });

        statusBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            posList.classList.add('hidden');
            statusList.classList.toggle('hidden');
        });

        posList?.querySelectorAll('div[data-value]').forEach(item => {
            item.addEventListener('click', () => {
                this.state.pos = item.getAttribute('data-value');
                this.render();
            });
        });

        statusList?.querySelectorAll('div[data-value]').forEach(item => {
            item.addEventListener('click', () => {
                this.state.status = item.getAttribute('data-value');
                this.render();
            });
        });

        toolbarEl.querySelector('#toggle-def-btn')?.addEventListener('click', () => {
            this.state.showDef = !this.state.showDef;
            this.render();
        });

        toolbarEl.querySelector('#toggle-sentence-btn')?.addEventListener('click', () => {
            this.state.showSentence = !this.state.showSentence;
            this.render();
        });

        toolbarEl.querySelector('#test-mode-btn')?.addEventListener('click', () => {
            if (this.testSession) {
                this.handleRequestCloseTest();
            } else {
                this.handleStartTest();
            }
        });

        // Swiggly divider
        const divider = document.createElement('div');
        divider.className = "w-full overflow-hidden leading-none pt-0 pb-1";
        divider.innerHTML = `
            <svg class="w-full h-4 text-[#E1E1E1]" viewBox="0 0 1200 20" fill="none" preserveAspectRatio="none">
                <path d="M0,10 Q12.5,0 25,10 T50,10 T75,10 T100,10 T125,10 T150,10 T175,10 T200,10 T225,10 T250,10 T275,10 T300,10 T325,10 T350,10 T375,10 T400,10 T425,10 T450,10 T475,10 T500,10 T525,10 T550,10 T575,10 T600,10 T625,10 T650,10 T675,10 T700,10 T725,10 T750,10 T775,10 T800,10 T825,10 T850,10 T875,10 T900,10 T925,10 T950,10 T975,10 T1000,10 T1025,10 T1050,10 T1075,10 T1100,10 T1125,10 T1150,10 T1175,10 T1200,10" stroke="currentColor" stroke-width="1.2" fill="none"/>
            </svg>
        `;
        main.appendChild(divider);

        // Content below the divider: either the normal word list, or the
        // active test's matching grid / results screen.
        const rowContainer = document.createElement('div');
        rowContainer.id = 'word-row-container';
        rowContainer.className = "pt-2";

        if (this.testSession) {
            const testContentEl = createTestContent(this.testSession, {
                onTileClick: this.handleTestTileClick,
                onRequestClose: this.handleRequestCloseTest,
                onCancelDiscard: this.handleCancelDiscardTest,
                onConfirmDiscard: this.handleConfirmDiscardTest,
                onDone: this.handleRequestCloseTest,
                onRetry: this.handleRetryTest
            });
            rowContainer.appendChild(testContentEl);
        } else if (filtered.length === 0) {
            rowContainer.innerHTML = `<div class="p-12 text-center text-[#767676]"><p>No matching vocabulary words found.</p></div>`;
        } else {
            rowContainer.className = "space-y-6 pt-2";
            filtered.forEach(item => {
                const rowEl = createWordRow(
                    item, 
                    this.state.showDef, 
                    this.state.showSentence, 
                    (w) => AudioService.speak(w), 
                    this.handleStatusToggle
                );
                rowContainer.appendChild(rowEl);
            });
        }

        main.appendChild(rowContainer);
        this.container.appendChild(main);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LexiconApp('app-root');
});