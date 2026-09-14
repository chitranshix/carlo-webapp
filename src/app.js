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
        // Test Mode is the app's default screen now, not an opt-in extra -
        // start with a live test session instead of the browse list. Safe
        // to call getTestPool() here since this.state/this.vocabList are
        // already set above; it just won't have <2 words on a fresh load.
        this.testSession = createTestSession(this.getTestPool(), 5);
        this.toast = null;
        this.toastTimeoutId = null;

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
        const pool = this.getTestPool();
        if (pool.length < 2) {
            this.showToast("Not enough words match the current filters to start a test - try widening them.");
            return;
        }
        this.testSession = createTestSession(pool, Math.min(5, pool.length));
        this.render();
    }

    // A small dismissible banner instead of a native alert() - stays
    // consistent with the rest of the app's custom-styled UI (the
    // exit-confirmation dialog, the toolbar, etc. are all custom too).
    showToast(message, duration = 3500) {
        if (this.toastTimeoutId) clearTimeout(this.toastTimeoutId);
        this.toast = message;
        this.render();
        this.toastTimeoutId = setTimeout(() => {
            this.toast = null;
            this.toastTimeoutId = null;
            this.render();
        }, duration);
    }

    handleRetryTest = () => {
        const pool = this.getTestPool();
        this.testSession = createTestSession(pool, Math.min(5, pool.length));
        this.render();
    }

    // The pool Test Mode draws from is just the current search/pos/status
    // filters applied to the word list - same filters as the browse view.
    // Exception: when Status is left on "all" we quietly drop Mastered words,
    // since a blind-random test would otherwise waste reps re-testing words
    // you already know. Explicitly filtering to "Mastered" (or any other
    // status) is respected as-is - that's how you deliberately drill revision.
    getTestPool() {
        const filtered = this.getFilteredData();
        if (this.state.status === 'all') {
            const notMastered = filtered.filter(item => item.status !== 'Mastered');
            return notMastered.length >= 2 ? notMastered : filtered;
        }
        return filtered;
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
        const hasAnsweredAnything = Object.keys(this.testSession.results).length > 0;
        if (isSessionComplete(this.testSession)) {
            // Results are already applied to vocabList - just close.
            this.testSession = null;
        } else if (hasAnsweredAnything) {
            // Only warn about losing progress if there's actually progress
            // to lose - otherwise (e.g. landing on the default test screen
            // and immediately clicking away) this dialog would fire before
            // the user has done anything at all.
            this.testSession.confirmingExit = true;
        } else {
            this.testSession = null;
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

    // Visual feedback for a blocked "hide the last visible clue" click:
    // shake the button that refused to toggle, and ring-highlight the
    // sibling button the user needs to turn on first. Uses the Web
    // Animations API directly rather than a CSS keyframe class, so it
    // doesn't depend on style.css defining one.
    flashBlockedToggle(blockedBtn, otherBtn) {
        blockedBtn?.animate(
            [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-4px)' },
                { transform: 'translateX(4px)' },
                { transform: 'translateX(-3px)' },
                { transform: 'translateX(3px)' },
                { transform: 'translateX(0)' }
            ],
            { duration: 320, easing: 'ease-in-out' }
        );

        if (otherBtn) {
            otherBtn.classList.add('ring-2', 'ring-[#111111]', 'ring-offset-1');
            setTimeout(() => otherBtn.classList.remove('ring-2', 'ring-[#111111]', 'ring-offset-1'), 700);
        }
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

        // Definitions and Sentences can each be hidden, but never both at
        // once - a card (in the list or in Test Mode) needs at least one
        // visible clue. Turning off the last visible one doesn't just do
        // nothing silently - it shakes the button you clicked and briefly
        // highlights the one you need to turn on first, so it's obvious
        // *why* nothing happened and what to do about it.
        const defBtn = toolbarEl.querySelector('#toggle-def-btn');
        const sentenceBtn = toolbarEl.querySelector('#toggle-sentence-btn');

        defBtn?.addEventListener('click', () => {
            if (this.state.showDef && !this.state.showSentence) {
                this.flashBlockedToggle(defBtn, sentenceBtn);
                return;
            }
            this.state.showDef = !this.state.showDef;
            this.render();
        });

        sentenceBtn?.addEventListener('click', () => {
            if (this.state.showSentence && !this.state.showDef) {
                this.flashBlockedToggle(sentenceBtn, defBtn);
                return;
            }
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
                onRetry: this.handleRetryTest,
                onAudioPlay: (w) => AudioService.speak(w),
                showDef: this.state.showDef,
                showSentence: this.state.showSentence
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

        if (this.toast) {
            const toastEl = document.createElement('div');
            toastEl.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-md";
            toastEl.innerHTML = `
                <span>${this.toast}</span>
                <button id="toast-dismiss-btn" class="text-white/70 hover:text-white transition cursor-pointer text-base leading-none">&times;</button>
            `;
            toastEl.querySelector('#toast-dismiss-btn')?.addEventListener('click', () => {
                if (this.toastTimeoutId) clearTimeout(this.toastTimeoutId);
                this.toastTimeoutId = null;
                this.toast = null;
                this.render();
            });
            this.container.appendChild(toastEl);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LexiconApp('app-root');
});