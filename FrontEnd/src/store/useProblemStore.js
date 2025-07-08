import { create } from "zustand";
import { axiosInstance } from "../libs/axios";

export const useProblemStore = create((set) => ({
  problems: [],
  problem: null,
  solvedProblems: [],
  isProblemsLoading: false,
  isProblemLoading: false,

  getAllProblems: async () => {
    set({ isProblemsLoading: true });
    try {
      const res = await axiosInstance.get("/problems");
      set({ problems: res.data.data });
    } catch (error) {
      console.log("Error getting problems", error);
    } finally {
      set({ isProblemsLoading: false });
    }
  },

  getProblemBySlug: async (slug) => {
    set({ isProblemLoading: true });
    try {
      const res = await axiosInstance.get(`/problems/${slug}`);
      set({ problem: res.data.data });
    } catch (error) {
      console.log("Error getting problem", error);
    } finally {
      set({ isProblemLoading: false });
    }
  },

  getSolvedProblems: async () => {
    try {
      const res = await axiosInstance.get("/problems/solved");
      set({ solvedProblems: res.data.data });
    } catch (error) {
      console.log("Error getting solved problems", error);
    }
  },
}));
