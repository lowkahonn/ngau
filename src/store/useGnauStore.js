import { create } from "zustand";
import { analyzeHand } from "../lib/gnau";

export const useGnauStore = create((set, get) => ({
  error: "",
  result: null,
  isResultDialogOpen: false,
  pickedCards: [],
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
  removeLastPickedCard: () => {
    const { pickedCards } = get();
    if (pickedCards.length === 0) return;
    const nextPicked = pickedCards.slice(0, -1);
    set({
      pickedCards: nextPicked,
      error: "",
      result: null,
      isResultDialogOpen: false
    });
  },
  analyze: () => {
    const { pickedCards } = get();
    if (pickedCards.length !== 5) {
      return;
    }
    const input = pickedCards.join(" ");
    try {
      const result = analyzeHand(input);
      set({ result, error: "", isResultDialogOpen: true });
    } catch (error) {
      set({ result: null, error: error.message, isResultDialogOpen: false });
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
