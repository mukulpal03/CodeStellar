import app from "./app.js";
import config from "./config/index.js";

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});
