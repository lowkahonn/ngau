import { create } from "zustand";
import { analyzeHand, parseCards } from "../lib/gnau";

const PRESETS = [
  "AS 3 6 8 K",
  "3 3 3 6 A",
  "3 3 6 6 A",
  "10 J Q K A"
];

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
  preview: [],
  pickedCards: [],
  aceSuit: "S",
  presets: PRESETS,
  setInput: (value) => {
    set({ input: value, preview: previewCards(value), error: "", result: null });
  },
  applyPreset: (preset) => {
    set({
      input: preset,
      preview: previewCards(preset),
      pickedCards: tokensFromInput(preset),
      error: "",
      result: null
    });
  },
  setAceSuit: (suit) => {
    set({ aceSuit: suit });
  },
  addPickedCard: (rank) => {
    const { pickedCards, aceSuit } = get();
    if (pickedCards.length >= 5) return;

    const nextCard = rank === "A" ? `A${aceSuit}` : rank;
    const nextPicked = [...pickedCards, nextCard];
    const nextInput = nextPicked.join(" ");
    set({
      pickedCards: nextPicked,
      input: nextInput,
      preview: previewCards(nextInput),
      error: "",
      result: null
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
      result: null
    });
  },
  syncPickedFromInput: () => {
    const { input } = get();
    const tokens = tokensFromInput(input);
    if (tokens.length === 5) {
      set({ pickedCards: tokens });
    }
  },
  analyze: () => {
    const { input } = get();
    try {
      const result = analyzeHand(input);
      set({ result, error: "" });
    } catch (error) {
      set({ result: null, error: error.message });
    }
  },
  clear: () => {
    set({
      input: "",
      error: "",
      result: null,
      preview: [],
      pickedCards: []
    });
  }
}));
