import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../libs/db.js";
import { validateReferenceSolution } from "../services/problem.service.js";

const createProblem = async (req, res) => {
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
    throw new ApiError(403, "You are not allowed to create a problem");
  }

  const result = await validateReferenceSolution(referenceSolution, testCases);

  if (!result) {
    throw new ApiError(400, "Invalid reference solution");
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
};

const getAllProblems = async (_req, res) => {
  const problems = await db.problem.findMany({
    select: {
      title: true,
      id: true,
    },
  });

  if (!problems) {
    throw new ApiError(404, "No problems found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Here are your all problems", problems));
};

const getProblemById = async (req, res) => {
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
    throw new ApiError(404, "No problem found");
  }

  res.status(200).json(new ApiResponse(200, "Here is your problem", problem));
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
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
    throw new ApiError(403, "You are not allowed to update a problem");
  }

  const problem = await db.problem.findUnique({
    where: {
      id,
    },
  });

  if (!problem) {
    throw new ApiError(404, "No problem found");
  }

  const result = validateReferenceSolution(referenceSolution, testCases);

  if (!result) {
    throw new ApiError(400, "Invalid reference solution");
  }

  const updatedProblem = await db.problem.update({
    where: {
      id: problem.id,
    },
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
    },
    select: {
      title: true,
      id: true,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Problem updated successfully", updatedProblem));
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  const problem = await db.problem.findUnique({
    where: {
      id,
    },
  });

  if (!problem) {
    throw new ApiError(404, "No problem found");
  }

  await db.problem.delete({
    where: {
      id: problem.id,
    },
  });

  res.status(200).json(new ApiResponse(200, "Problem deleted successfully"));
};

const getSolvedProblems = async (req, res) => {
  const problems = await db.problem.findMany({
    where: {
      ProblemSolved: {
        some: {
          userId: req.user.id,
        },
      },
    },
    include: {
      ProblemSolved: {
        where: {
          userId: req.user.id,
        },
      },
    },
  });

  if (!problems) {
    throw new ApiError(404, "No problems found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Here are your solved problems", problems));
};

export {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  getSolvedProblems,
};
