import { create } from "zustand";

export const useProjectStatsStore = create((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}));