import app from "#/app";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
  console.log("Docs at http://localhost:3000/openapi.json");
});
