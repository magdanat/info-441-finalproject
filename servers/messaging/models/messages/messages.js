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
const sqlPOSTChannelMessage = "INSERT INTO messages (MessageBody, UserID) VALUES(?, ?)"

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

// Need to import function
// import {sendMessageToRabbitMQ} from '../channels/channels.js'
// this.sendMessageToRabbitMQ = sendMessageToRabbitMQ();

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


// // POST request to v1/channels/:channelID
// app.post("/:channelID", (req, res, next) => {
//     if (!checkXUserHeader(req)) {
//         res.status(401).send("Unauthorized");
//     } else {
//         let user = JSON.parse(req.get('X-User'));
//         let message = req.body.body;
//         // Need to check if this is a private channel
//         connection.query(sqlGETChannelByID, [req.params.channelID], (err, result) => {
//             if (err) {
//                 res.status(500).send("Internal Server Error1");
//             } else {
//                 let channel = result[0];
//                 connection.query(sqlGETSeeIfMember, [user.id, req.params.channelID], (err, result) => {
//                     let currentUserMembership = false;
//                     if (result[0] != undefined) {
//                         currentUserMembership = true;
//                     }
//                     if (currentUserMembership || !channel.ChannelPrivate) {
//                         connection.query(sqlPOSTChannelMessage, [req.params.channelID, message, new Date(), user.id], (err, result) => {
//                             if (err) {
//                                 res.status(500).send("Internal Server Error1");
//                             } else {
//                                 connection.query(sqlGETMessageByID, [result.insertId], (err, result) => {
//                                     if (err) {
//                                         res.status(500).send("Internal Server Error3");
//                                     } else {
//                                         res.status(201);
//                                         res.set("Content-Type", "application/json");
//                                         res.json(result);

//                                         // Send event to RabbitMQ Server
//                                         // create event object
//                                         let event = { "type": "message-new", "message": result }
//                                         // check if the channel is private, if it is get all MemberIDs and add to event object
//                                         // get channelID from message
//                                         let channelID = result.ChannelID;
//                                         // grab the channel itself
//                                         connection.query(sqlGETChannelByID, [channelID], (err, result) => {
//                                             // check if the channel is private
//                                             if (result.ChannelPrivate) {
//                                                 connection.query(sqlGETMembersOfPrivateChannel, [result.ChannelID], (err, result) => {
//                                                     event.userIDs = result;
//                                                 })
//                                             }
//                                         })
//                                         // write to queue
//                                         // have not made function 'publishToQueue' yet
//                                         sendMessageToRabbitMQ(JSON.stringify(event));
//                                     }
//                                 })
//                             }
//                         })
//                     } else {
//                         res.status(403).send("Forbidden");
//                     }
//                 })
//             }
//         })
//     }
// })

app.post("/", (req, res, next) => {
    let user = req.body.user.id;
    console.log(user);
    let message = req.body.body;
    connection.query(sqlPOSTChannelMessage, [message, user], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {
            console.log(result);
            // Need to get messageID to share it with other users
            connection.query(sqlGETMessageByID, [result.insertId], (err, result) => {
                if (err) {
                    res.status(500).send("Internal Server Error");
                } else {
                    // res.status(201)
                    // let msg = {type: "message-new", message: me}
                    let mqMessage = (result[0].MessageBody);
                    res.status(201)
                    res.set("Content-Type" , "application/json");
                    res.json(result);
                }
            })
        }
    })
})

// // PATCH request to v1/messages/{messageID}
// app.patch("/:messageID", (req, res, next) => {
//     if (!checkXUserHeader(req)) {
//         res.status(401).send("Unauthorized");
//     } else {
//         // check is user created the message
//         connection.query(sqlGETMessageByID, [req.params.messageID], (err, result) => {
//             if (err) {
//                 res.status(500).send("Internal Server Error");
//             } else {
//                 if (checkIfCreator(req, result)) {
//                     let messageBody = req.body.body ? req.body.body : "";
//                     // Patch the message
//                     connection.query(sqlPATCHMessageByID, [messageBody, req.params.messageID], (err, result) => {
//                         if (err) {
//                             res.status(500).send("Internal Server Error");
//                         } else {
//                             // Need to return the updated message
//                             connection.query(sqlGETMessageByID, [req.params.messageID], (err, result) => {
//                                 if (err) {
//                                     res.status(500).send("Internal Server Error");
//                                 } else {
//                                     res.set("Content-Type", "application/json");
//                                     res.json(result);
                                    
//                                     // Send event to RabbitMQ Server
//                                     // create event object
//                                     let event = { "type": "message-update", "message": result }
//                                     // check if the channel is private, if it is get all MemberIDs and add to event object
//                                     // get channelID from message
//                                     let channelID = result.ChannelID;
//                                     // grab the channel itself
//                                     connection.query(sqlGETChannelByID, [channelID], (err, result) => {
//                                         // check if the channel is private
//                                         if (result.ChannelPrivate) {
//                                             connection.query(sqlGETMembersOfPrivateChannel, [result.ChannelID], (err, result) => {
//                                                 event.userIDs = result;
//                                             })
//                                         }
//                                     })
//                                     // write to queue
//                                     // have not made function 'publishToQueue' yet
//                                     sendMessageToRabbitMQ(JSON.stringify(event));
//                                 }
//                             })
//                         }
//                     })
//                 } else { 
//                     res.status(403).send("Forbidden");
//                 }
//             }
//         })
//     }
// })

// // DELETE: If the current user isn't the creator of this message, respond with the status code 
// // 403 (Forbidden). Otherwise, delete the message and respond with a the plain text message 
// // indicating that the delete was successful.
// app.delete("/:messageID", (req, res, next) => {
//     let channelID;
//     if (!checkXUserHeader(req)) {
//         res.status(401).send("Unauthorized");
//     } else {
//         connection.query(sqlGETMessageByID, [req.params.messageID], (err, result) => {
//             if (err) {
//                 res.status(500).send("Internal Server Error");
//             } else {
//                 // grab the channelID from the message
//                 channelID = result.ChannelID;
//                 if (checkIfCreator(req, result)) {
//                     connection.query(sqlDELETEMessageByID, [req.params.messageID], (err, result) => {
//                         if (err) {
//                             res.status(500).send("Internal Server Error");
//                         } else { 
//                             // respond with a the plain text message
//                             // indicating that the delete was successful.
//                             res.send('Delete Successful!')

//                             // Send event to RabbitMQ Server
//                             // create event object
//                             let event = { "type": "message-delete", "message": req.params.messageID}
//                             // check if the channel is private, if it is get all MemberIDs and add to event object
//                             // grab the channel itself
//                             connection.query(sqlGETChannelByID, [channelID], (err, result) => {
//                                 // check if the channel is private
//                                 if (result.ChannelPrivate) {
//                                     connection.query(sqlGETMembersOfPrivateChannel, [result.ChannelID], (err, result) => {
//                                         event.userIDs = result;
//                                     })
//                                 }
//                             })
//                             // write to queue
//                             // have not made function 'publishToQueue' yet
//                             sendMessageToRabbitMQ(JSON.stringify(event));
//                         }
//                     })
//                 } else {
//                     res.status(403).send("Forbidden");
//                 }
//             }
//         })
//     }
// })

// // Function to see if X-User header is present in request
// function checkXUserHeader(req) {
//     let xUserHeader = req.get('X-User');
//     if (xUserHeader == undefined || xUserHeader == "") {
//         return false;
//     } else {
//         return true;
//     }
// }

// // Edited this function to work for messages instead of channels
// // Need to test if it actually works or not
// function checkIfCreator(req, result) {
//     let message = result[0];
//     let user = JSON.parse(req.get('X-User'));
//     if (message.MessageCreator == user.id) {
//         return true;
//     } else {
//         return false;
//     }
// }

module.exports = app;