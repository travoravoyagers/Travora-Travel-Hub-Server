require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Socket.io connection
io.on("connection", (socket) => {
  socket.on("join_chat", (userId) => {
    socket.join(userId);
  });
  
  socket.on("send_message", (data) => {
    // Forward message to the receiver's room
    io.to(data.receiver_id).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    // handle disconnect
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

// Swagger UI route
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ message: "Travora API is running" });
});

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/api/user", userRoutes);

const tripRoutes = require("./routes/trip.routes");
app.use("/api/trips", tripRoutes);

const friendRoutes = require("./routes/friend.routes");
app.use("/api/friends", friendRoutes);

const chatRoutes = require("./routes/chat.routes");
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
});