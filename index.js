const { spawn } = require("child_process");
const express = require("express");
const app = express();

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/index.css", (_, res) => {
  res.sendFile(__dirname + "/index.css");
});

app.get("/video", (req, res) => {
  const headers = {
    "Content-Type": "video/webm",
    "Transfer-Encoding": "chunked",
    Connection: "keep-alive",
  };

  res.writeHead(200, headers);

  const ffmpeg = spawn("ffmpeg", [
    "-f",
    "video4linux2",
    "-framerate",
    "30",
    "-video_size",
    "hd720",
    "-input_format",
    "mjpeg",
    "-i",
    "/dev/video0",
    "-c:v",
    "libvpx",
    "-b:v",
    "1M",
    "-c:a",
    "libvorbis",
    "-f",
    "webm",
    "pipe:1",
  ]);
  console.log("Client connected ", req.ip);
  ffmpeg.stdout.on("data", (chunk) => {
    res.write(chunk);
  });

  ffmpeg.stderr.on("data", (data) => {
    // console.log(${data});
  });

  res.on("close", () => {
    console.log("Client disconnected", req.ip, "Shutting down ffmpeg stream");

    ffmpeg.kill("SIGINT");
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Listening on port 3000");
});
