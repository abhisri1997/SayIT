const express = require("express");
const socket = require("socket.io");

const app = express();
const cors = require("cors");

const HOST = process.env.HOST || "http://127.0.0.1";
const PORT = process.env.PORT || 4000;
const origin = [
  `${HOST}:${PORT}`,
  "http://localhost:5173",
  "http://192.168.29.220:5173",
];

// Allow cors from specific origin
const corsOptions = {
  origin,
};

app.use(cors(corsOptions));

const users = {};

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${HOST}:${PORT}`);
});

const socketIO = socket(server, {
  cors: {
    origin,
  },
});

//Add this before the app.get() block
socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("newUser", (userName) => {
    users[socket.id] = userName;
    console.log(users);
    socket.broadcast.emit("newUser", userName);
  });

  socket.on("message", (data) => {
    const { socketID, message } = data;
    console.log(`📨: ${users[socketID]} sent a message`);
    const output = {
      userName: users[socketID],
      message,
    };
    console.log("Emitting message to all users", output);
    socketIO.emit("message", output);
  });

  socket.on("typing", (data) => {
    socketIO.emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log(`😢 : ${users[socket.id]} disconnected`);
    delete users[socket.id];
    console.log(users);
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});
