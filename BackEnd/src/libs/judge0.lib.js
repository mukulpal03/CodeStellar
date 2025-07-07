import axios from "axios";
import config from "../config/env.js";

const getJudge0LanguageId = (language) => {
  const languageMap = {
    JAVA: 62,
    JAVASCRIPT: 63,
    PYTHON: 71,
  };

  return languageMap[language.toUpperCase()];
};

const getLanguageName = (languageId) => {
  const LANGUAGE_NAMES = {
    74: "Typescript",
    63: "Javascript",
    71: "Python",
    62: "Java",
  };

  return LANGUAGE_NAMES[languageId] || "Unknown";
};

const submitBatch = async (submissions) => {
  try {
    const { data } = await axios.post(
      `${config.JUDGE0_API_URI}/submissions/batch`,
      {
        submissions,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${config.JUDGE0_API_SECRET}`,
        },
      },
    );

    return data;
  } catch (error) {
    console.error(
      error?.response?.data ?? error.message ?? "Submit batch error",
    );

    throw error;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pollBatchResults = async (tokens) => {
  while (true) {
    try {
      const { data } = await axios.get(
        `${config.JUDGE0_API_URI}/submissions/batch`,
        {
          params: {
            tokens: tokens.join(","),
            base64_encoded: false,
          },
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${config.JUDGE0_API_SECRET}`,
          },
        },
      );

      const results = data.submissions;

      const isAllDone = results.every(
        (r) => r.status.id !== 1 && r.status.id !== 2,
      );

      if (isAllDone) return results;

      await sleep(1000);
    } catch (error) {
      console.error(
        error?.response?.data ?? error.message ?? "Poll batch results error",
      );

      throw error;
    }
  }
};

export { submitBatch, pollBatchResults, getJudge0LanguageId, getLanguageName };
