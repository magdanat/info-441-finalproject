"use strict";
// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

// Create a new express application
const app = express.Router();

// SQL Queries /v1/game
const sqlGETAllGames = "SELECT * FROM games";
const sqlGETGameByID = "SELECT * FROM games WHERE GameID = ?";
const sqlPOSTGame = "INSERT INTO games (LobbyName, LobbyDesc, GameCreator) VALUES(?, ?, ?)"

// SQL Queries /v1/game/:gameID
const sqlPATCHGameByID = "UPDATE games SET LobbyName = ?, LobbyDesc = ? WHERE GameID = ?";
const sqlDELETEGameFROMUsersGames = "DELETE FROM users_game WHERE GameID = ?";
const sqlDELETEMessagesByGameID = "DELETE FROM messages WHERE GameID = ?";
const sqlDELETEGameByGameID = "DELETE FROM games WHERE GameID = ?";
const sqlDELETEGameInstanceByID = "DELETE FROM games_instance WHERE GameID = ?";

// SQL Queries /v1/game/:gameID/players
const sqlPOSTUserGames = "INSERT INTO users_game (GameID, UserID) VALUES (?, ?)"
const sqlDELETEGamePlayerByID = "DELETE FROM users_game WHERE UserID = ? AND GameID = ?";
const sqlGETUsersGames = "SELECT * FROM users_game WHERE GameID = ?";

const sqlGETGameInstanceByID = "SELECT * FROM Games_Instance WHERE GameID = ?";
const sqlPOSTGameInstance = "INSERT INTO Games_Instance (GameID, NumberOfRounds, BoardID) VALUES(?, ?, ?)"
const sqlPATCHGameInstance = "UPDATE Games_Instance SET CurrentDrawer = ?, CurrentRound = ?, CurrentWord = ?, Winner = ?, Score = ? WHERE GameID = ?";
const sqlPOSTBoard = "INSERT INTO Board (Drawing) VALUES(?)"
const sqlPATCHBoardByID = "UPDATE Board SET Drawing = ?, WHERE BoardID = ?";
const sqlPOSTMessage = "INSERT INTO Messages (UserID, GameID, MessageBody) VALUES(?, ?, ?)"
const sqlPATCHMessage = "UPDATE Messages SET MessageBody = ?, WHERE MessageID = ?";

// SQL Queries /v1/game/:gameID/instance 
const sqlPOSTInstance = "INSERT INTO games_instance(GameID) VALUES(?)"

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

//////////////
// /v1/game //
//////////////

// Refers to all current games.

// WORKS IN POSTMAN
// Get request to '/v1/game'
// Gets all current active games.
// 200: Successfully retrieves current game information
// 401: Attempts to access game which player is not part of
// 500: Internal server error
app.get("/", (req, res, next) => {
    // if (!checkXUserHeader(req)) {
    //     res.status(401).send("Unauthorized");
    // } else {
        connection.query(sqlGETAllGames, [], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201);
                res.set("Content-Type", "application/json");
                res.json(result);
            }
        })
    // }
});

// WORKS IN POSTMAN
// Post request to '/v1/game'
// Creates a new game lobby.
// 201: Successfully creates a new game
// 401: Cannot verify players id_value
// 500: Internal server error
app.post("/", (req, res, next) => {
    // if (!checkXUserHeader(req)) {
    //     res.status(401).send("Unauthorized");
    // } else {
        let user = req.body.user;
        let name = user.userName + "'s Lobby";
        let description = req.body.description ? req.body.description : "";
        // sql request to insert 
        // not sure if correctly grabbing userID here
        connection.query(sqlPOSTGame, [name, description, user.id], (err, result) => {
            if (err) {
                console.log("Error: " + err);
                res.status(500).send("Internal Server Error");
            } else {
                console.log(result.insertId)
                connection.query(sqlPOSTUserGames, [result.insertId, user.id], (err, result) => {
                    if (err) {
                        console.log("Error: " + err);
                        res.status(500).send("Internal Server Error");
                    } else {
                        res.status(201);
                        res.set("Content-Type", "application/json");
                        res.json(result);
                    }
                }) 
            }
            // Need to send event to RabbitMQ Server
        })
});

//////////////////////
// /v1/game/:gameID //
//////////////////////

// Refers to a specific game identified by {gameID}.

// WORKS IN POSTMAN
// Get request to '/v1/game/:gameID'
// Gets current game information.
// 201: Successfully retrieves current game information
// 401: Attempts to access game which player is not part of
// 500: Internal server error
app.get("/:gameID", (req, res, next) => {
    // if (!checkXUserHeader(req)) {
    //     res.status(401).send("Unauthorized");
    // } else {
        connection.query(sqlGETGameByID, [req.params.gameID], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                let game = result[0];
                res.status(201);
                res.set("Content-Type", "application/json");
                res.json(result);
            }
        })
    // }
});

// // UNTESTED IN POSTMAN
// // Patch request to '/v1/game/gameID'
// // Update current game name, description, players, etc. 
// // Conditions: Only the creator of the game should be able to change game information.
// // 201: application/json. Successfully updates a game
// // 401: player attempts to update game information not relating to them. 
// //      Such as drawer, drawing_board, messages, or other people’s game_player
// // 500: Internal server error
// // Might need to add a condition where once a game is started, the game is closed and no one can
// app.patch("/:gameID", (req, res, next) => {
//     // if (!checkXUserHeader(req)) {
//     //     res.status(401).send("Unauthorized");
//     // } else {
//         // let user = JSON.parse(req.get('X-User'));
//         if (checkIfCreator(req, result)) {
//             let lobbyDesc = req.body.description ? req.body.description : "";
//             let lobbyName = req.body.lobbyName ? req.body.lobbyName : "";
//             // Patch the game
//             connection.query(sqlPATCHGameByID, [lobbyName, lobbyDesc, req.params.gameID], (err, result) => {
//                 if (err) {
//                     res.status(500).send("Internal Server Error");
//                 } else {
//                     res.set("Content-Type", "application/json");
//                     res.json(result);
//                     // Send event to RabbitMQ Server
//                 }
//             })
//         }
//     // }
// });

// WORKS IN POSTMAN
// Could use more testing. 
// Delete request to '/v1/games/gameID'
// Removes a game lobby.
// Conditions: Either all players leave the lobby or the creator deletes the lobby or the game is finished.
// 201: application/json. Successfully deletes game.
// 401: player attemtps to delete game that they did not create. 
// 500: Internal server error
app.delete("/:gameID", (req, res, next) => {
    console.log("Before sqlGETGameByID");
    connection.query(sqlGETGameByID, [req.params.gameID], (err, result) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            // need to check if there are no members in the channel still
            console.log("before sqlDELETEGameFROMUsersGames")
            connection.query(sqlDELETEGameFROMUsersGames, [req.params.gameID], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error.");
                } else {
                    // Remove from instances.
                    connection.query(sqlDELETEGameInstanceByID, [req.params.gameID], (err, result) => {
                        if (err) {
                            res.status(500).send("Internal Server Error");
                        } else {
                            // Remove from games.
                            connection.query(sqlDELETEGameByGameID, [req.params.gameID], (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send("Internal Server Error");
                                } else {
                                    res.status(200).send("Delete was successful.")
                                    // Send event to RabbitMQ Server
                                }
                            })
                        }
                    })
                }
            })
        }
    })
});

///////////////////////////////
// /v1/game/{gameID}/players //
///////////////////////////////

// Refers to current players in the game lobby.

// WORKS IN POSTMAN
// Post request to '/v1/game/:gameID/players
// Adds a new player to the game lobby.
// 201: application/json. Successfully adds user to game instance.
// 500: Internal server error
app.post("/:gameID/players", (req, res, next) => {
    // if (!checkXUserHeader(req)) {
    //     res.status(401).send("Unauthorized");
    // } else {
        connection.query(sqlGETGameByID, [req.params.gameID], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                let userID = req.body.id
                connection.query(sqlGETUsersGames, [req.params.gameID], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Internal Server Error")
                    } else {
                        // need to check the current size of the lobby before allowing a user to enter.
                        // cannot allow user to join lobby if lobby is at the max players.
                        // do a query call to select all users from users_games with for gameID. if
                        // the size of the return is larger than 4, do not allow user to join.
                        if (result.length != 4 && result.length < 4) {
                            connection.query(sqlPOSTUserGames, [req.params.gameID, userID], (err, result) => {
                                if (err) {
                                    res.status(500).send("Internal Server Error");
                                } else {
                                    res.status(201);
                                    res.set("Content-Type", "application/json");
                                    res.json(result);
                                    //RabbitMQ event
                                }
                            })
                        } else {
                            res.send("Lobby is full!");
                        }
                    }
                })
            }
        })
    // }
})

// WORKS IN POSTMAN
// Get request to '/:gameID/players'
// Returns all the players currently in a game lobby/instance.
// 201: Succesfully retrieves all players.
// 500: Internal server error.
app.get("/:gameID/players", (req, res, next) => {
    connection.query(sqlGETUsersGames, [req.params.gameID], (err, result) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            res.status(201);
            res.set("Content-Type", "application/json");
            res.json(result);
        }
    })
})

// WORKS IN POSTMAN
// DELETE request to '/v1/game/:gameID/players
// Removes a player from the game lobby/instance.
// Conditions: User leaves the instance or closes browser???
// 201: application/json. Successfully adds user to game instance.
// 500: Internal server error
app.delete("/:gameID/players", (req, res, next) => {
    connection.query(sqlGETGameByID, [req.params.gameID], (err, result) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            let userID = req.body.id;
            connection.query(sqlDELETEGamePlayerByID, [userID, req.params.gameID], (err, result) => {
                if (err) {
                    res.status(500).send("Internal Server Error");
                } else {
                    res.status(200).send("Delete was successful.");
                    //RabbitMQ event
                }
            })
        }
    })
})

// Perhaps consider putting all the API requests below this comment
// in another .js file to separate game lobbies
// from game instances.

///////////////////////////////
// /v1/game/:gameID/instance //
///////////////////////////////


// Refers to information in the current game. 
// This is information pertains to scores,
// drawing board information, current words,
// ect.

// WORKS IN POSTMAN
// Post request to '/v1/game/:gameID/instance
// Creates a new game instance. *the actual game*
// 201: application/json. Sucecessfully creates a game instance.
// 500: Internal server error.
app.post("/:gameID/instance", (req, res, next) => {
    // if (!checkXUserHeader(req)) {
    //     res.status(401).send("Unauthorized");
    // } else {
        // create a board, get the board ID in return
        let newBoard = ""; // empty string = blank board
        connection.query(sqlPOSTBoard, [newBoard], (err, result) => {
            console.log(err);
            let boardID = result.boardID;
            // query to insert into Games_Instance Table
            connection.query(sqlPOSTGameInstance, [req.params.gameID, req.body.numRounds, boardID], (err, result) => {
                if (err) {
                    res.status(500).send("Internal Server Error");
                } else {
                    res.status(201);
                    res.set("Content-Type", "application/json");
                    res.json(result);
                }
            })

        })
    // }
})

// WORKS IN POSTMAN
// Get request to '/v1/game/:gameID/instance
// Retrieves current game instance information such as scores.
// 201: application/json. Successfully retrieves game information.
app.get("/:gameID/instance", (req, res, next) => {
    connection.query(sqlGETGameInstanceByID, [req.params.gameID], (err, result) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            res.status(201);
            res.set("Content-Type", "application/json");
            res.json(result);
        }
    })
})

// WORKS IN POSTMAN
// Patch request to '/v1/game/:gameID/:instanceID
// Updates information such as scores, drawing board, current words,
// ect.
// USED TO START THE ROUND
// Mainly going to be used to update drawing board information.
// 201: application/json. Successfully makes changes to the game instance.
// 500: Internal server error3.
app.patch("/:gameID/instance", (req, res, next) => {
    // query current game instance and get all data
    connection.query(sqlGETGameInstanceByID, [req.params.gameID], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {
            // check each variable, if missing insert current data
            let currDrawer = req.body.currentDrawer ? req.body.currentDrawer : result.currentDrawer;
            let currRound = req.body.currentRound ? req.body.currentRound : result.currentRound;
            let currWord = req.body.currentWord ? req.body.currentWord : result.currentWord;
            let winner = req.body.winner? req.body.winner : result.winner; 
            // if we want to display the winner, maybe just handle on the frontend
            let score = req.body.score ? req.body.score : result.score;

            // query to make changes in Games_Instance Table
            connection.query(sqlPATCHGameInstance, [currDrawer, currRound, currWord, winner, score, req.params.gameID], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                } else {
                    res.status(201);
                    res.set("Content-Type", "application/json");
                    res.json(result);

                    // RabbitMQ work here. 
                }
            })
        }
    })
})

/////////////////////////////////////
// /v1/game/:gameID/instance/board //
/////////////////////////////////////

// PATCH
// Updates Board, can update with empty string (blank board) to drawer changes
app.patch(":gameID/instance/board", (req, res, next) => {
    connection.query(sqlGETGameInstanceByID, [req.params.instanceID], (err, result) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            let boardID = result.boardID;
            connection.query(sqlPATCHBoardByID, [req.drawing, boardID], (err, result) => {
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
})

///////////////////////
// Messages (Answer) //
///////////////////////

// Post

// Post request to '/v1/game/:gameID/:instanceID/message
// Create new message (answer)
// 201: application/json. Sucecessfully create message
// 500: Internal server error.
app.post(":gameID/:instanceID/message", (req, res, next) => {
    connection.query(sqlPOSTMessage, [userID, req.params.gameID, req.body.messageBody], (err, result) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            res.status(201);
            res.set("Content-Type", "application/json");
            res.json(result);
        }
    })
})


// Patch 
// 
app.patch(":gameID/:instanceID/message", (req, res, next) => {
    connection.query(sqlPATCHMessage, [req.body.messageBody, req.params.messageID], (err, result) => {
        if(err) {
            res.status(500).send("Internal Server Error");
        } else {
            res.status(200);
            res.set("Content-Type", "application/json");
            res.json(result.messageBody);
        }
    })
})

////////////////////
// HELPER METHODS //
////////////////////

// Function that checks if the current user is the creator of the channel, will send a forbidden request
// if the user is not the creator
function checkIfCreator(req, result) {
    let game = result[0];
    // let user = JSON.parse(req.get('X-User'));
    if (game.gameCreator == req.user.id) {
        console.log(game);
        return true;
    } else {
        console.log(game);
        return false;
    }
}
  
  // Need to export the router
  module.exports = app;

// patch request to game instance, get new word