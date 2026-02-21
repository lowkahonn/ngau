import { create } from "zustand";
import { analyzeHand } from "../lib/gnau";
import { addHistoryRecord, clearHistoryRecords, createHistoryRecord, createSessionId, getHistoryOverview } from "../lib/historyDb";

const HISTORY_LIMIT = 3;

const EMPTY_HISTORY_STATS = {
  totalHands: 0,
  sessionHands: 0,
  typeCounts: [],
  biggestHands: []
};

export const useGnauStore = create((set, get) => ({
  error: "",
  result: null,
  isResultDialogOpen: false,
  pickedCards: [],
  history: [],
  historyGroups: [],
  historyStats: EMPTY_HISTORY_STATS,
  sessionId: createSessionId(),
  isHistoryLoading: false,
  historyError: "",
  language: "zh-Hant",
  theme: "dark",
  setLanguage: (language) => {
    set({ language });
  },
  setTheme: (theme) => {
    set({ theme });
  },
  addPickedCard: (cardToken) => {
    const { pickedCards } = get();
    if (pickedCards.length >= 5) return;
    const nextPicked = [...pickedCards, cardToken];
    set({
      pickedCards: nextPicked,
      error: "",
      result: null,
      isResultDialogOpen: false
    });
  },
  removePickedCard: (index) => {
    const { pickedCards } = get();
    if (index < 0 || index >= pickedCards.length) return;

    const nextPicked = pickedCards.filter((_, i) => i !== index);
    set({
      pickedCards: nextPicked,
      error: "",
      result: null,
      isResultDialogOpen: false
    });
  },
  initializeHistory: async () => {
    await get().refreshHistoryOverview();
  },
  refreshHistoryOverview: async () => {
    const { sessionId } = get();
    set({ isHistoryLoading: true, historyError: "" });
    try {
      const overview = await getHistoryOverview(sessionId, HISTORY_LIMIT);
      set({
        history: overview.history,
        historyGroups: overview.historyGroups,
        historyStats: overview.historyStats,
        isHistoryLoading: false
      });
    } catch (error) {
      set({
        isHistoryLoading: false,
        historyError: error instanceof Error ? error.message : String(error)
      });
    }
  },
  analyze: async () => {
    const { pickedCards } = get();
    if (pickedCards.length !== 5) {
      return;
    }
    const input = pickedCards.join(" ");
    try {
      const result = analyzeHand(input);
      const historyEntry = createHistoryRecord({
        cards: [...pickedCards],
        best: result.best,
        sessionId: get().sessionId
      });
      set((state) => ({
        result,
        error: "",
        isResultDialogOpen: true,
        history: [historyEntry, ...state.history].slice(0, HISTORY_LIMIT)
      }));

      try {
        await addHistoryRecord(historyEntry);
        await get().refreshHistoryOverview();
      } catch (persistError) {
        set({ historyError: persistError instanceof Error ? persistError.message : String(persistError) });
      }
    } catch (error) {
      set({ result: null, error: error.message, isResultDialogOpen: false });
    }
  },
  loadHistoryHand: (cards) => {
    if (!Array.isArray(cards) || cards.length !== 5) return;
    set({
      pickedCards: [...cards],
      error: "",
      result: null,
      isResultDialogOpen: false
    });
  },
  clearHistory: async () => {
    try {
      await clearHistoryRecords();
      set({
        history: [],
        historyGroups: [],
        historyStats: EMPTY_HISTORY_STATS,
        historyError: ""
      });
    } catch (error) {
      set({ historyError: error instanceof Error ? error.message : String(error) });
    }
  },
  closeResultDialog: () => {
    set({ isResultDialogOpen: false });
  },
  clear: () => {
    set({
      error: "",
      result: null,
      pickedCards: [],
      isResultDialogOpen: false
    });
  }
}));
