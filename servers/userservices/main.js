"use strict";
const games = require("./models/games/games");
const users = require("./models/users/users");
var cors = require('cors')

const express = require("express");

const addr = process.env.ADDR || ":80";

const [host, port] = addr.split(":");

const app = express();
var cors = require('cors')

app.use(cors());

app.use(express.json());

app.use("/v1/games", games);
app.use("/v1/users", users);

app.listen(port, () => {
    console.log('Server is running locally at '  + addr);
});