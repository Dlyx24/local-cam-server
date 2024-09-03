const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { exec } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static("public"));

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Handle video frames from the server's webcam
  socket.on("video-frame", (frame) => {
    // Broadcast the frame to all connected clients
    socket.broadcast.emit("video-frame", frame);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start capturing video from the server's webcam using FFmpeg
  const ffmpeg = exec(
    `ffmpeg -f v4l2 -i /dev/video0 -f image2pipe -vcodec mjpeg -q:v 2 -`
  );

  // Send video frames to the connected clients
  ffmpeg.stdout.on("data", (data) => {
    io.emit("video-frame", data.toString("base64"));
  });

  ffmpeg.stderr.on("data", (data) => {
    console.error("FFmpeg error:", data.toString());
  });
});
