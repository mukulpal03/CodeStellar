import { db } from "../libs/db.js";

const getSubmissions = async (req, res) => {
  const userId = req.user.id;

  const submissions = await db.submission.findMany({
    where: {
      userId,
    },
  });

  if (!submissions) {
    throw new ApiError(404, "No submissions found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Here are your submissions", submissions));
};

const getSubmissionById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const submission = await db.submission.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!submission) {
    throw new ApiError(404, "No submission found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Here is your submission", submission));
};

const getSubmissionsForProblem = async (req, res) => {};

export { getSubmissions, getSubmissionById, getSubmissionsForProblem };
