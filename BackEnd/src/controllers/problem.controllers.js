import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const createProblem = async (req, res, next) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippet,
    referenceSolution,
  } = req.body;

  if (!req.user.role !== "ADMIN") {
    return next(new ApiError(403, "You are not allowed to create a problem"));
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return next(new ApiError(400, `Language ${language} is not supported`));
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return next(
            new ApiError(
              400,
              `Testcase ${i + 1} failed for language ${language}`,
            ),
          );
        }
      }

      const problem = await db.problem.create({
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippet,
        referenceSolution,
        userId: req.user.id,
      });

      return res
        .status(201)
        .json(
          new ApiResponse(201, "New problem created successfully", problem),
        );
    }
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Error while creating a problem"));
  }
};

export { createProblem };
