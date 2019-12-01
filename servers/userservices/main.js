"use strict";

const express = require("express");

const addr = process.env.ADDR || ":80";

const [host, port] = addr.split(":");

const app = express();

app.use(express.json());

app.listen(port, () => {
    console.log('Server is running locally at '  + addr);
});