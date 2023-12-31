const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const { execSync } = require('child_process')
const { createHash } = require('crypto')

const app = express();

app.get("/pull/:key", (req, res) => {
  const keySha = createHash('sha256').update(req.params.key).digest('hex')
  if(keySha !== "b29c483a0c94d740962ed5cf804a9cfe5af1cd1e52b7a6d50c624982565a60a4") {
    res.send("Missing key")
    return
  }
  execSync("git pull")
  process.exit(0)
  res.send("OK")
})

const httpserver = http.Server(app);
const io = socketio(httpserver, {
  cors: {
    origin: "*"
  }
});

httpserver.listen(3000);

io.on('connection', socket => {
  console.log("conn")
  socket.on('disconnect', reason => {
    console.log("Disconneted.")
  });
  socket.on('message', data => {
    if(data.type === "enter"){
      socket.join(data.room)
    }
    io.to(data.room).emit('message', data)
    console.log(data)
  });
});
