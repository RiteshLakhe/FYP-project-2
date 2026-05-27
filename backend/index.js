require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/dbcon");
const cors = require("cors");
const mainRoutes = require("./routes/index.routes");
const path = require("path");
const { bootstrapData } = require("./utils/bootstrapData");

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

const corsOption = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOption));
app.options(/.*/, cors(corsOption));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", mainRoutes);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    const bootstrapSummary = await bootstrapData();
    console.log("Bootstrap complete:", bootstrapSummary);
    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
