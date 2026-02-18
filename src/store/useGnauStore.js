import { create } from "zustand";
import { analyzeHand, parseCards } from "../lib/gnau";

const PRESETS = [
  "AS 3 6 8 K",
  "3 3 3 6 A",
  "3 3 6 6 A",
  "10 J Q K A"
];

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
  presets: PRESETS,
  setInput: (value) => {
    set({ input: value, preview: previewCards(value) });
  },
  applyPreset: (preset) => {
    set({ input: preset, preview: previewCards(preset), error: "", result: null });
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
    set({ input: "", error: "", result: null, preview: [] });
  }
}));
