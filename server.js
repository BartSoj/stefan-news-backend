const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
mongoose.connection.once("open", () => console.log("MongoDB database connection established successfully"));

const articlesRouter = require("./routes/articles");
app.use("/articles", articlesRouter);

const uploadsRouter = require("./routes/uploads");
app.use("/upload", uploadsRouter);

const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

app.listen(port, () => console.log(`Server is running on port: ${port}`));