import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.json());
app.use(cors());

let state;

server.listen(3000, () => console.log("Server started on port 3000"));

io.on("connection", (socket) => {
  console.log(`${io.engine.clientsCount} users connected`);

  if (state) {
    socket.emit("state", state);
  }

  socket.broadcast.to("admin").emit("connectionCount", io.engine.clientsCount);

  socket.on("adminIdentify", () => {
    state = undefined;
    socket.join("admin");
  });

  socket.on("state", (newState) => {
    state = newState;
    console.log("state:", newState);

    io.emit("state", newState);
  });

  socket.on("userConnected", (user) => {
    console.log("userConnected");
    socket.broadcast
      .to("admin")
      .emit("userConnected", { user, count: io.engine.clientsCount });
  });

  socket.on("posterVote", (msg) => {
    console.log("posterVote:", msg);

    socket.broadcast.to("admin").emit("posterVote", msg);
  });

  socket.on("allowEmojis", () => {
    state = "emojis";
    io.emit("allowEmojis");
  });

  socket.on("allowPlayback", () => {
    state = "playback";
    io.emit("allowPlayback");
  });

  socket.on("reaction", (msg) => {
    console.log("reaction:", msg);

    socket.broadcast.to("admin").emit("reaction", msg);
  });

  socket.on("action", (msg) => {
    console.log("action:", msg);

    socket.broadcast.to("admin").emit("action", msg);
  });

  socket.on("disconnect", () => console.log("user disconnected"));
});
