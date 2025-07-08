import slugify from "slugify";
import { ApiError } from "./ApiError.js";
import { db } from "../libs/db.js";

const generateUniqueSlug = async (title) => {
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new ApiError(
      "Title is required and must be a non-empty string to generate a slug.",
    );
  }

  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    trim: true,
  });

  if (!baseSlug) {
    throw new ApiError(
      400,
      "Could not generate a valid slug from the provided title. Please use more alphanumeric characters.",
    );
  }

  let slug = baseSlug;
  let count = 0;
  let existingProblem = null;

  while (true) {
    try {
      existingProblem = await db.problem.findUnique({
        where: { slug: slug },
        select: { id: true },
      });
    } catch (error) {
      throw new ApiError(
        `Database error while checking slug uniqueness: ${error.message}`,
      );
    }

    if (!existingProblem) {
      break;
    }

    count++;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
};

export { generateUniqueSlug };
