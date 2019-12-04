"use strict";
const express = require("express");
// const channels = require("./models/channels/channels");
const messages = require("./models/messages/messages");

//get ADDR environment variable,
//defaulting to ":80", Only needs to handle simple HTTP requests
const addr = process.env.ADDR || ":3000";

//split host and port using destructuring
const [host, port] = addr.split(":");

// Create app
const app = express();

// add JSON request body parsing middleware
app.use(express.json());

// app.use("/v1/channels", channels);
app.use("/v1/messages", messages);

app.listen(port, () => {
    console.log('Server is running locally at '  + addr);
});