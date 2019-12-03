"use strict";
// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

// Create a new express application
const app = express.Router();

const amqp = require('amqplib/callback_api');

const sqlPOSTMessage = "INSERT INTO Messages (UserID, GameID, MessageBody) VALUES(?, ?, ?)"

// Connection to the mysql database
let connection = mysql.createPool({
    // We are going to need to set this ENV variable, TODO
    host: process.env.MYSQL_ADDR,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DB
});

function sendMessageToRabbitMQ(msg) {
  amqp.connect("amqp://" + process.env.RABBITADDR, (error0, conn) => {
    if (error0) {
      throw error0;
    }
    conn.createChannel((error1, ch) => {
      if (error1) {
        throw error1;
      }
      let queueName = process.env.RABBITNAME;
      ch.assertQueue(queueName, { durable: false });
      ch.sendToQueue(queueName, Buffer.from(msg));
    });
    setTimeout(function () {
      conn.close();
      process.exit(0);
    }, 500);
  });
}

///////////////////////
// Messages (Answer) //
///////////////////////

// Post
// Inserts a new message into the database.
app.post("/", (req, res, next) => {
    if (!checkXUserHeader(req)) { 
        res.status(401).send("Unauthorized");
    } else {
        connection.query(sqlPOSTMessage, [req.body.userid, req.body.gameid, req.body.message], (err, result) => {
            if (err) { 
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201);
                res.set("Content-Type", "application/json");
                res.json(result);
            }
        })
    }
})

// Patch 
// 