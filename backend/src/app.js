import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
  try {
    const mongoURI =
      "mongodb+srv://jothsna:WinnerJothsna9506@clusterme.lxynesr.mongodb.net/video_conference?retryWrites=true&w=majority";

    const connectionDb = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected to HOST: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log(`Server listening on port ${app.get("port")}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

start();
