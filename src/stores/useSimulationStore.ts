import { create } from "zustand";
import type { SimulationParams } from "@/types";

interface SimulationStore {
  baseScenario: SimulationParams | null;
  currentParams: SimulationParams | null;
  isComparing: boolean;
  initParams: (params: SimulationParams) => void;
  setCurrentParams: (params: Partial<SimulationParams>) => void;
  fixBaseScenario: () => void;
  clearComparison: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  baseScenario: null,
  currentParams: null,
  isComparing: false,
  initParams: (params) => set({ currentParams: params }),
  setCurrentParams: (params) =>
    set((state) => ({
      currentParams: state.currentParams
        ? { ...state.currentParams, ...params }
        : null,
    })),
  fixBaseScenario: () => {
    const { currentParams } = get();
    if (currentParams) {
      set({ baseScenario: { ...currentParams }, isComparing: true });
    }
  },
  clearComparison: () => set({ baseScenario: null, isComparing: false }),
}));
