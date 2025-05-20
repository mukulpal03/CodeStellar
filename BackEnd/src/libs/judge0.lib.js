import axios from "axios";
import config from "../config/env";

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
  const { data } = await axios.post(
    `${config.JUDGE0_API_URI}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    },
  );

  return data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(
      `${config.JUDGE0_API_URI}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
      },
    );

    const results = data.submissions;

    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2,
    );

    if (isAllDone) return results;

    await sleep(1000);
  }
};

export { submitBatch, pollBatchResults, getJudge0LanguageId, getLanguageName };
