import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../libs/axios";

export const useExecutionStore = create((set) => ({
  isExecuting: false,
  submissionData: null,

  executeCode: async (
    source_code,
    language_id,
    stdin,
    expected_outputs,
    problemId
  ) => {
    try {
      set({ isExecuting: true });
      const res = await axiosInstance.post("/execute-code", {
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problemId,
      });

      set({ submissionData: res.data.data });

      toast.success(res.data.message);
    } catch (error) {
      console.log("Error executing code", error);
      toast.error(error.response.data.message ?? "Error executing code");
    } finally {
      set({ isExecuting: false });
    }
  },
}));
