import { create } from "zustand";

export const useAllTasksStore = create((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
}));
