"use strict";

// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

//create a new express application
const app = express.Router();

// Used for PATCH for messages
const sqlGETMessageByID = "SELECT * FROM messages WHERE MessageID = ?";
const sqlPATCHMessageByID = "UPDATE messages SET MessageBody = ? WHERE MessageID = ?"
const sqlDELETEMessageByID = "DELETE FROM messages WHERE MessageID = ?"
const sqlPOSTMessage = "INSERT INTO messages (MessageBody, UserID) VALUES(?, ?)"


// Connecting to the mysql database
let connection = mysql.createPool({
    // We are going to need to set this ENV variable, TODO
    // host: process.env.MYSQL_ADDR,
    // user: 'root',
    // password: process.env.MYSQL_ROOT_PASSWORD,
    // database: process.env.MYSQL_DB
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


// POST request to v1/messages
// how to get the user id??
app.post("/", (req, res, next) => {
    let message = req.body.message;
    connection.query(sqlPOSTMessage, [message, user.id], (err, result) => { 
        if (err) { 
            res.status(500).send("Unable to post message");
        } else { 
            // not sure if this is correct
            res.status(201);
            res.set("Content-Type", "application/json");
            res.json(result);

            // Send event to RabbitMQ Server
            // create event object
            let event = { "type": "message-new", "message": result }
            // check if the channel is private, if it is get all MemberIDs and add to event object
            // get channelID from message
            let channelID = result.ChannelID;
            // grab the channel itself
            connection.query(sqlGETChannelByID, [channelID], (err, result) => {
                // check if the channel is private
                if (result.ChannelPrivate) {
                    connection.query(sqlGETMembersOfPrivateChannel, [result.ChannelID], (err, result) => {
                        event.userIDs = result;
                    })
                }
            })
            // write to queue
            // have not made function 'publishToQueue' yet
            sendMessageToRabbitMQ(JSON.stringify(event));
        }
    })
})

module.exports = app;