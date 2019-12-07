"use strict";
const express = require("express");
const messages = require("./models/messaging/messages");

//get ADDR environment variable,
//defaulting to ":80", Only needs to handle simple HTTP requests
const addr = process.env.ADDR || ":80";
//split host and port using destructuring
const [host, port] = addr.split(":");
// Create app
const app = express();

// add JSON request body parsing middleware
app.use(express.json());
// var cors = require('cors');
// app.use(cors());

// API Routes
app.use("/v1/messages", messages);

console.log("Main.js is running...");
app.listen(port, () => {
    console.log('Server is running locally at '  + addr);
});