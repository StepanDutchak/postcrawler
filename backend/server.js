const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var multer = require("multer");
var upload = multer();
var admin = require("firebase-admin");
const socket = require("socket.io");


const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// database
const db = require("./app/models");
const Role = db.role;

// for parsing multipart/form-data
// app.use(upload.array());
app.use(express.static("public"));

// for parsing application/json
app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route

app.get("/api/test", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
// require("./app/routes/activities.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8898;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on port ${PORT}.`);
});


// io = socket(server);

// io.on("connection", (socket) => {
//   console.log(socket.id);

//   socket.on("join_room", (data) => {
//     socket.join(data);
//     console.log("User Joined Room: " + data);
//   });

//   socket.on("send_message", (data) => {
//     console.log(data);
//     socket.to(data.room).emit("receive_message", data.content);
//   });

//   socket.on("disconnect", () => {
//     console.log("USER DISCONNECTED");
//   });
// });