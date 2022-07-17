var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Router = require("./routes/router");

var app = express();

var mongoURL =
  "mongodb+srv://admin:admin@storeservice.ho38s.mongodb.net/?retryWrites=true&w=majority";
const options = {
  dbName: "store",
};
mongoose.connect(mongoURL, options);
var db = mongoose.connection;

db.on("connected", () => console.log("MongoDB connected successfully"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", Router);

module.exports = app;
