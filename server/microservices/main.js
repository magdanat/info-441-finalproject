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

// API Routes
app.use("/v1/messages", messages);

app.listen(port, () => {
    console.log('Server is running locally at '  + addr);
});