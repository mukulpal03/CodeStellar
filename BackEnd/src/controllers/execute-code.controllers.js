import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const executeCode = async (req, res, next) => {
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

    console.log(result);

    if (result.status.id !== 3) {
      throw new ApiError(400, `Testcase ${i + 1} failed`);
    }
  }

  res.status(200).json(new ApiResponse(200, "Code executed successfully"));
};

export { executeCode };
