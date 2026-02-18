import { create } from "zustand";
import { analyzeHand, parseCards } from "../lib/gnau";

function toInputToken(card) {
  const rank = card.rank === "T" ? "10" : card.rank;
  if (rank === "A" && card.suit) return `A${card.suit}`;
  return rank;
}

function tokensFromInput(input) {
  try {
    return parseCards(input).map(toInputToken);
  } catch {
    return [];
  }
}

function previewCards(input) {
  try {
    return parseCards(input);
  } catch {
    return [];
  }
}

export const useGnauStore = create((set, get) => ({
  input: "",
  error: "",
  result: null,
  isResultDialogOpen: false,
  preview: [],
  pickedCards: [],
  language: "zh-Hant",
  theme: "dark",
  setLanguage: (language) => {
    set({ language });
  },
  setTheme: (theme) => {
    set({ theme });
  },
  setInput: (value) => {
    const preview = previewCards(value);
    const cards = tokensFromInput(value);
    set({
      input: value,
      preview,
      pickedCards: cards.length <= 5 ? cards : [],
      error: "",
      result: null,
      isResultDialogOpen: false
    });
  },
  addPickedCard: (rank) => {
    const { pickedCards } = get();
    if (pickedCards.length >= 5) return;

    const nextCard = rank;
    const nextPicked = [...pickedCards, nextCard];
    const nextInput = nextPicked.join(" ");
    set({
      pickedCards: nextPicked,
      input: nextInput,
      preview: previewCards(nextInput),
      error: "",
      result: null,
      isResultDialogOpen: false
    });
  },
  removePickedCard: (index) => {
    const { pickedCards } = get();
    if (index < 0 || index >= pickedCards.length) return;

    const nextPicked = pickedCards.filter((_, i) => i !== index);
    const nextInput = nextPicked.join(" ");
    set({
      pickedCards: nextPicked,
      input: nextInput,
      preview: previewCards(nextInput),
      error: "",
      result: null,
      isResultDialogOpen: false
    });
  },
  syncPickedFromInput: () => {
    const { input } = get();
    const tokens = tokensFromInput(input);
    if (tokens.length <= 5) {
      set({ pickedCards: tokens });
    }
  },
  analyze: () => {
    const { input } = get();
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
      input: "",
      error: "",
      result: null,
      preview: [],
      pickedCards: [],
      isResultDialogOpen: false
    });
  }
}));
