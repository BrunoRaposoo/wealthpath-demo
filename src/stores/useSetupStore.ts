import { create } from "zustand";
import type { MarketData, SetupInput } from "@/types";

interface SetupStore {
  formData: SetupInput | null;
  marketData: MarketData | null;
  setFormData: (data: SetupInput) => void;
  setMarketData: (data: MarketData) => void;
  clearSetup: () => void;
}

export const useSetupStore = create<SetupStore>((set) => ({
  formData: null,
  marketData: null,
  setFormData: (data) => set({ formData: data }),
  setMarketData: (data) => set({ marketData: data }),
  clearSetup: () => set({ formData: null, marketData: null }),
}));
