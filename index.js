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

  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on("data", (data) => {
    console.error(`ffmpeg error: ${data}`);
  });

  res.on("close", () => {
    ffmpeg.kill("SIGINT");
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
