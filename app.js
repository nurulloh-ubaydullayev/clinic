const express = require("express");
const app = express();
const router = require("./routes/routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8000;

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.set("view engine", "ejs");
app.use("/views", express.static(__dirname + "/views"));
app.use("/public", express.static(__dirname + "/public"));

app.listen(PORT, () => console.log("Server is running on port " + PORT));
