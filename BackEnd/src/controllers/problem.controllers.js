import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../libs/db.js";

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

  if (req.user.role !== "ADMIN") {
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
    }

    const problem = await db.problem.create({
      data: {
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
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "New problem created successfully", problem));
  } catch (error) {
    return next(new ApiError(500, "Error while creating a problem"));
  }
};

const getAllProblems = async (req, res, next) => {
  const problems = await db.problem.findMany({
    select: {
      title: true,
      id: true,
    },
  });

  if (!problems) {
    return next(new ApiError(404, "No problems found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Here are your all problems", problems));
};

const getProblemById = async (req, res, next) => {
  const { id } = req.params;

  const problem = await db.problem.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
      id: true,
    },
  });

  if (!problem) {
    return next(new ApiError(404, "No problem found"));
  }

  res.status(200).json(new ApiResponse(200, "Here is your problem", problem));
};

export { createProblem, getAllProblems, getProblemById };
