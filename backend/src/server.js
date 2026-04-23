const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { connectDb } = require("./config/db");
const { seedInitialData } = require("./utils/seed");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required in environment");
  }

  await connectDb(MONGODB_URI);
  console.log("MongoDB connected");

  if (String(process.env.SEED_ON_START || "true") === "true") {
    await seedInitialData();
  }

  app.listen(PORT, () => {
    console.log(`Backend started on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start backend", err);
  process.exit(1);
});
