require("dotenv").config({
  path: "./.env",
});
require("rootpath")();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const router = require("routes/api");
const { swaggerUIServe,swaggerUISetup } = require("kernels/api-docs");
const cors = require('cors');

const app = express();
app.disable("x-powered-by");
app.use(cors({
  origin: 'http://localhost:4200' // Allow requests from http://localhost:4200
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", router);
app.use(express.json());
app.use("/api-docs", swaggerUIServe, swaggerUISetup);

module.exports = app
