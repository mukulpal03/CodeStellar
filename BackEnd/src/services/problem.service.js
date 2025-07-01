import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { ApiError } from "../utils/ApiError.js";

const validateReferenceSolution = async (referenceSolution, testCases) => {
  try {
    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        throw new ApiError(400, `Language ${language} is not supported`);
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      if (!submissionResults || submissionResults.length !== testCases.length) {
        throw new ApiError(
          500,
          "Failed to get submission tokens from Judge0 for all test cases.",
        );
      }

      const tokens = submissionResults.map((r) => r.token);

      if (tokens.some((token) => !token)) {
        throw new ApiError(
          500,
          "Received invalid submission tokens from Judge0.",
        );
      }

      const results = await pollBatchResults(tokens);

      console.log(results);

      if (!results || results.length !== tokens.length) {
        throw new ApiError(
          500,
          "Failed to get results from Judge0 for all submitted tokens.",
        );
      }

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (
          !result ||
          !result.status ||
          typeof result.status.id === "undefined"
        ) {
          throw new ApiError(
            500,
            `Received an invalid result structure from Judge0 for test case ${testCaseNumber} in ${language}.`,
          );
        }

        if (result.status.id !== 3) {
          throw new ApiError(
            400,
            `Testcase ${i + 1} failed for language ${language}`,
          );
        }
      }
    }

    return true;
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error while validating reference solution");
  }
};

export { validateReferenceSolution };
