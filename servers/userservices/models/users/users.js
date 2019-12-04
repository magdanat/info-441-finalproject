"use strict";
// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

// Create a new express application
const app = express.Router();

// SQL Queries to '/v1/users'
const sqlPOSTUsers = "INSERT INTO users (UserName) VALUES(?)";
const sqlDELETEUsersByID = "DELETE FROM users WHERE UserID = ?";


// Connection to the mysql database
let connection = mysql.createPool({
    // We are going to need to set this ENV variable, TODO
    host: '127.0.0.1',
    user: 'root',
    password: '123456789',
    database: 'scribble'
});

const amqp = require('amqplib/callback_api');
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

///////////////
// /v1/users //
///////////////

// Post request to '/v1/users'
// Creates a new user.
// 201: Successfully creates a new user and inserts it into the database.
// 500: Internal server error
app.post("/", (req, res, next) => {
    let username = req.body.username  
    connection.query(sqlPOSTUsers, [username], (err, result) => {
        if (err) {
            console.log("Result: " + result);
            console.log("Error: " + err);
            res.status(500).send("Internal Server Error.");
        } else {
            res.status(201);
            res.set("Content-Type", "application/json");
            res.json(result);
        }
    })
});

// Get Request to '/v1/users'

// Probably need to delete users from the other tables where userID is located 
// but worry about this later. 
// Delete request to '/v1/users'
// Deletes userID
// 201: Succesffully deletes a user from the database.
// 500: Internal Server error.
app.delete("/", (req, res, next) => {
    connection.query(sqlDELETEUsersByID, [req.body.userid], (err, result) => {
      if (err) {
        res.status(500).send("Internal Server Error.");
      } else {
        res.status(200).send("Delete was successful");
        //Rabbit mq.
      }
    }) 
});

////////////////////
// HELPER METHODS //
////////////////////

// Function that checks if the current user is the creator of the channel, will send a forbidden request
// if the user is not the creator
function checkIfCreator(req, result) {
    let game = result[0];
    let user = JSON.parse(req.get('X-User'));
    if (game.gameCreator == user.id) {
        return true;
    } else {
        return false;
    }
}
  
  // Need to export the router
  module.exports = app;