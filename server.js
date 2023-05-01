require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRouter = require("./routes/userRoute");
// const questionRouter = require("./routes/questionRoute");

//routers
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/auth", authRouter);
// app.use("/questions", questionRouter);

const port = 5500;

app.get("/", (req, res) => {
  res.send("Welcome to secure authentication api");
});

mongoose.connect("mongodb://127.0.0.1:27017/SECURE_AUTH");

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Database connected"));

app.listen(port, () => console.log("server started on port", port));
