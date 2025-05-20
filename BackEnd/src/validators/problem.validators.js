import { z } from "zod";

const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

const exampleSchema = z.object({
  input: z.string().min(1, "Example input cannot be empty"),
  output: z.string().min(1, "Example output cannot be empty"),
  explanation: z.string().optional(),
});

const testCaseSchema = z.object({
  input: z.string().min(1, "Test case input cannot be empty"),
  expectedOutput: z
    .string()
    .min(1, "Test case expected output cannot be empty"),
  isHidden: z.boolean().default(false),
});

const codeSnippetSchema = z.record(z.string());

const constraintsSchema = z
  .object({
    timeLimit: z.string().optional(),
    memoryLimit: z.string().optional(),
  })
  .catchall(z.any());

const createProblemSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters long")
      .max(255),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters long"),
    difficulty: difficultyEnum,
    tags: z
      .array(z.string().min(1))
      .min(1, "At least one tag is required")
      .optional(),
    examples: z.array(exampleSchema).min(1, "At least one example is required"),
    constraints: constraintsSchema.optional(),
    hints: z.string().optional(),
    editorial: z.string().optional(),
    testCases: z
      .array(testCaseSchema)
      .min(1, "At least one test case is required"),
    codeSnippet: codeSnippetSchema.optional(),
    referenceSolution: codeSnippetSchema.optional(),
  }),
});

const updateProblemSchema = z.object({
  body: z
    .object({
      title: z.string().min(5).max(255).optional(),
      description: z.string().min(20).optional(),
      difficulty: difficultyEnum.optional(),
      tags: z.array(z.string().min(1)).min(1).optional(),
      examples: z.array(exampleSchema).min(1).optional(),
      constraints: constraintsSchema.optional(),
      hints: z.string().optional().nullable(),
      editorial: z.string().optional().nullable(),
      testCases: z.array(testCaseSchema).min(1).optional(),
      codeSnippet: codeSnippetSchema.optional().nullable(),
      referenceSolution: codeSnippetSchema.optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update.",
    }),
  params: z.object({
    problemId: z.string().uuid("Invalid problem ID format"),
  }),
});

export { createProblemSchema, updateProblemSchema };
