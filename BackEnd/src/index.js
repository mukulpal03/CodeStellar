import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});
