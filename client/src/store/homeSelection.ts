import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HomeSelection {
  courseId?: string;
  unitId?: string;
  setCourse: (courseId: string | undefined) => void;
  setUnit: (unitId: string | undefined) => void;
}

export const useHomeSelection = create<HomeSelection>()(
  persist(
    (set) => ({
      setCourse: (courseId) => set({ courseId, unitId: undefined }),
      setUnit: (unitId) => set({ unitId }),
    }),
    {
      name: "cude:home-selection",
      partialize: ({ courseId, unitId }) => ({ courseId, unitId }),
    },
  ),
);
