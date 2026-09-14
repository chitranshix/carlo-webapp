export type PartOfSpeech = 'all' | 'noun' | 'verb' | 'adj' | 'adv';
export type WordStatus = 'Unseen' | 'Learning' | 'Mastered';

export interface VocabularyItem {
    id: number;
    word: string;
    pos: Exclude<PartOfSpeech, 'all'>;
    definition: string;
    sentence: string;
    status: WordStatus;
}

export interface AppState {
    search: string;
    pos: PartOfSpeech;
    status: string;
    showDef: boolean;
    showSentence: boolean;
}