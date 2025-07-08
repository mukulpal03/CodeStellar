import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../libs/db.js";
import { validateReferenceSolution } from "../services/problem.service.js";
import { generateUniqueSlug } from "../utils/slug.js";

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

  const result = await validateReferenceSolution(referenceSolution, testCases);

  if (!result) {
    throw new ApiError(
      400,
      "The provided reference solution did not pass all test cases.",
    );
  }

  const slug = await generateUniqueSlug(title, db);

  const problem = await db.problem.create({
    data: {
      title,
      slug,
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
    include: {
      ProblemSolved: {
        where: {
          userId: _req.user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Here are your all problems", problems));
};

const getProblemBySlugForUser = async (req, res) => {
  const { slug } = req.params;

  const problem = await db.problem.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
      tags: true,
      examples: true,
      constraints: true,
      hints: true,
      codeSnippet: true,
    },
  });

  if (!problem) {
    throw new ApiError(404, "Problem not found or not available.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Problem details retrieved successfully", problem),
    );
};

const updateProblem = async (req, res) => {
  const { id } = req.params;

  const existingProblem = await db.problem.findUnique({
    where: { id },
  });

  if (!existingProblem) {
    throw new ApiError(404, "Problem not found to update.");
  }

  const dataToUpdate = {};
  const allowedFields = [
    "title",
    "description",
    "difficulty",
    "tags",
    "examples",
    "constraints",
    "hints",
    "editorial",
    "testCases",
    "codeSnippet",
    "referenceSolution",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      dataToUpdate[field] = req.body[field];
    }
  });

  if (Object.keys(dataToUpdate).length === 0) {
    throw new ApiError(400, "No valid fields provided for update.");
  }

  if (dataToUpdate.title && dataToUpdate.title !== existingProblem.title) {
    dataToUpdate.slug = await generateUniqueSlug(dataToUpdate.title, db);
  } else {
    delete dataToUpdate.slug;
  }

  if (
    dataToUpdate.referenceSolution !== undefined ||
    dataToUpdate.testCases !== undefined
  ) {
    const solutionToValidate =
      dataToUpdate.referenceSolution !== undefined
        ? dataToUpdate.referenceSolution
        : existingProblem.referenceSolution;
    const testCasesToValidateWith =
      dataToUpdate.testCases !== undefined
        ? dataToUpdate.testCases
        : existingProblem.testCases;

    if (
      !solutionToValidate ||
      !Array.isArray(testCasesToValidateWith) ||
      testCasesToValidateWith.length === 0
    ) {
      throw new ApiError(
        400,
        "If updating reference solution or test cases, both must be valid and test cases non-empty.",
      );
    }
    const validationResult = await validateReferenceSolution(
      solutionToValidate,
      testCasesToValidateWith,
    );

    if (!validationResult) {
      throw new ApiError(
        400,
        "The provided reference solution did not pass validation.",
      );
    }
  }

  const updatedProblem = await db.problem.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
      tags: true,
      examples: true,
      constraints: true,
      hints: true,
      editorial: true,
      codeSnippet: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res
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

  res.status(204).send();
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
  getProblemBySlugForUser,
  updateProblem,
  deleteProblem,
  getSolvedProblems,
};
