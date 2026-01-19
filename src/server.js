require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI route
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ message: "Travora API is running" });
});

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
});

const userRoutes = require("./routes/user.routes");
app.use("/api/user", userRoutes);
