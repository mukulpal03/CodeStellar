import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../libs/db.js";

const executeCode = async (req, res) => {
  const { source_code, language_id, stdin, expected_outputs, problemId } =
    req.body;

  const userId = req.user.id;

  if (
    !Array.isArray(stdin) ||
    stdin.length === 0 ||
    !Array.isArray(expected_outputs) ||
    expected_outputs.length !== stdin.length
  ) {
    throw new ApiError(400, "Invalid or missing test cases");
  }

  const submissions = stdin.map((input) => ({
    source_code,
    language_id,
    stdin: input,
  }));

  const submitResponse = await submitBatch(submissions);

  const tokens = submitResponse.map((res) => res.token);

  const results = await pollBatchResults(tokens);

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    if (result.status.id !== 3) {
      throw new ApiError(400, `Testcase ${i + 1} failed`);
    }
  }

  let allPassed = true;

  const detailedResults = results.map((result, i) => {
    const stdout = result.stdout?.trim();
    const expected_output = expected_outputs[i]?.trim();
    const passed = stdout === expected_output;

    if (!passed) allPassed = false;

    return {
      testCase: i + 1,
      passed,
      stdout,
      expectedOutput: expected_output,
      stderr: result.stderr || null,
      compileOutput: result.compile_output || null,
      status: result.status.description,
      memory: result.memory ? `${result.memory} KB` : undefined,
      time: result.time ? `${result.time} s` : undefined,
    };
  });

  const submission = await db.submission.create({
    data: {
      userId,
      problemId,
      sourceCode: source_code,
      language: getLanguageName(language_id),
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
      stderr: detailedResults.some((r) => r.stderr)
        ? JSON.stringify(detailedResults.map((r) => r.stderr))
        : null,
      compileOutput: detailedResults.some((r) => r.compile_output)
        ? JSON.stringify(detailedResults.map((r) => r.compile_output))
        : null,
      status: allPassed ? "Accepted" : "Wrong Answer",
      time: detailedResults.some((r) => r.time)
        ? JSON.stringify(detailedResults.map((r) => r.time))
        : null,
      memory: detailedResults.some((r) => r.memory)
        ? JSON.stringify(detailedResults.map((r) => r.memory))
        : null,
    },
  });

  if (allPassed) {
    await db.ProblemSolved.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {},
      create: {
        userId,
        problemId,
      },
    });
  }

  const testCaseResults = detailedResults.map((result) => ({
    submissionId: submission.id,
    testCase: result.testCase,
    passed: result.passed,
    stdout: result.stdout,
    expectedOutput: result.expectedOutput,
    stderr: result.stderr,
    compileOutput: result.compileOutput,
    status: result.status,
    memory: result.memory,
    time: result.time,
  }));

  await db.testCaseResult.createMany({
    data: testCaseResults,
  });

  const submissionWithTestCase = await db.submission.findUnique({
    where: {
      id: submission.id,
    },
    include: {
      testCaseResults: true,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Code executed successfully",
        submissionWithTestCase,
      ),
    );
};

export { executeCode };
