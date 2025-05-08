import { db } from "../libs/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getSheets = async (req, res) => {
  const sheets = await db.sheet.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  if (!sheets) {
    throw new ApiError(404, "No sheets found");
  }

  res.status(200).json(new ApiResponse(200, "Here are your sheets", sheets));
};

const getSheetById = async (req, res) => {
  const { id } = req.params;

  const sheet = await db.sheet.findUnique({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  if (!sheet) {
    throw new ApiError(404, "No sheet found");
  }

  res.status(200).json(new ApiResponse(200, "Here is your sheet", sheet));
};

const createSheet = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  const sheet = await db.sheet.create({
    data: {
      name,
      description,
      userId,
    },
  });

  if (!sheet) {
    throw new ApiError(500, "Error while creating sheet");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Sheet created successfully", sheet));
};

const updateSheet = async (req, res) => {
  const { id } = req.params;

  const sheet = await db.sheet.findUnique({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!sheet) {
    throw new ApiError(404, "No sheet found");
  }

  const { name, description } = req.body;

  await db.sheet.update({
    where: {
      id,
      userId: req.user.id,
    },
    data: {
      name,
      description,
    },
  });

  res.status(200).json(new ApiResponse(200, "Sheet updated successfully"));
};

const deleteSheet = async (req, res) => {
  const { id } = req.params;

  const sheet = await db.sheet.findUnique({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!sheet) {
    throw new ApiError(404, "No sheet found");
  }

  await db.sheet.delete({
    where: {
      id,
      userId: req.user.id,
    },
  });

  res.status(200).json(new ApiResponse(200, "Sheet deleted successfully"));
};

const addProblemToSheet = async (req, res) => {
  const { id } = req.params;

  const sheet = await db.sheet.findUnique({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!sheet) {
    throw new ApiError(404, "No sheet found");
  }

  const { problemId } = req.body;

  const problem = await db.problem.findUnique({
    where: {
      id: problemId,
    },
  });

  if (!problem) {
    throw new ApiError(404, "No problem found");
  }

  await db.sheet.update({
    where: {
      id,
      userId: req.user.id,
    },
    data: {
      problems: {
        connect: {
          id: problemId,
        },
      },
    },
  });

  res.status(200).json(new ApiResponse(200, "Problem added successfully"));
};

const removeProblem = async (req, res) => {
  const { id } = req.params;

  const sheet = await db.sheet.findUnique({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!sheet) {
    throw new ApiError(404, "No sheet found");
  }

  const { problemId } = req.body;

  const problem = await db.problem.findUnique({
    where: {
      id: problemId,
    },
  });

  if (!problem) {
    throw new ApiError(404, "No problem found");
  }

  await db.sheet.update({
    where: {
      id,
      userId: req.user.id,
    },
    data: {
      problems: {
        disconnect: {
          id: problemId,
        },
      },
    },
  });

  res.status(200).json(new ApiResponse(200, "Problem removed successfully"));
};

export {
  getSheets,
  getSheetById,
  createSheet,
  updateSheet,
  deleteSheet,
  addProblemToSheet,
  removeProblem,
};
