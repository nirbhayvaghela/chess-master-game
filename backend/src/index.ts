import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import socketHandler from "./socket";

import authRouter from "./routes/auth.route";
import gameRoomRouter from "./routes/game-room.route";
import { connectRedis } from "./redis";

dotenv.config({
  path: "./.env",
});

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});

connectRedis().then(() => {
  console.log("Connected to Redis");
  console.log("*", "Redis URL");
});

socketHandler(io);

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/game-room", gameRoomRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Chess Master Game API");
});

// app.use(errorHandler);

server.listen(process.env.PORT || 8000, () => {
  console.log(`App listening on port ${process.env.PORT || 8000}`);
});
