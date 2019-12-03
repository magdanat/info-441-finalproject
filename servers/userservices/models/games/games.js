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
const sqlDELETEGameFROMUsersGames = "DELETE FROM users_games WHERE GameID = ?";
const sqlDELETEMessagesByGameID = "DELETE FROM messages WHERE GameID = ?";
const sqlDELETEGameByGameID = "DELETE FROM games WHERE GameID = ?";

// SQL Queries /v1/game/:gameID/players
const sqlPOSTUserGames = "INSERT INTO users_game (GameID, UserID) VALUES (?, ?)"
const sqlDELETEGamePlayerByID = "DELETE FROM users_game WHERE UserID = ? AND GameID = ?";

const sqlGETGameInstanceByID = "SELECT * FROM Games_Instance WHERE GameInstanceID = ?";
const sqlPOSTGameInstance = "INSERT INTO Games_Instance (GameID, NumberOfRounds, BoardID) VALUES(?, ?, ?)"
const sqlPATCHGameInstance = "UPDATE Games_Instance SET CurrentDrawer = ?, CurrentRound = ?, CurrentWord = ?, Winner = ?, Score = ?, WHERE GameInstancID = ?";
const sqlPOSTBoard = "INSERT INTO Board (Drawing) VALUES(?)"
const sqlPATCHBoardByID = "UPDATE Board SET Drawing = ?, WHERE BoardID = ?";
const sqlPOSTMessage = "INSERT INTO Messages (UserID, GameID, MessageBody) VALUES(?, ?, ?)"
const sqlPATCHMessage = "UPDATE Messages SET MessageBody = ?, WHERE MessageID = ?";

// SQL Queries /v1/game/:gameID/instance 
const sqlPOSTInstance = "INSERT INTO games_instance(GameID) VALUES(?)"

// Connection to the mysql database
let connection = mysql.createPool({
    // We are going to need to set this ENV variable, TODO
    host: process.env.MYSQL_ADDR,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DB
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

// Get request to '/v1/game'
// Gets all current active games.
// 200: Successfully retrieves current game information
// 401: Attempts to access game which player is not part of
// 500: Internal server error
app.get("/", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        connection.query(sqlGETAllGames, [], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201);
                res.set("Content-Type", "application/json");
                res.json(result);
            }
        })
    }
});

// Post request to '/v1/game'
// Creates a new game lobby.
// 201: Successfully creates a new game
// 401: Cannot verify players id_value
// 500: Internal server error
app.post("/", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        let user = JSON.parse(req.get('X-User'));
        let name = user.userName + "'s Lobby";
        let description = req.body.description ? req.body.description : "";
        // sql request to insert 
        // not sure if correctly grabbing userID here
        connection.query(sqlPOSTGame, [name, description, user.id], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(201);
                res.set("Content-Type", "application/json");
                res.json(result);
            }
            // Need to send event to RabbitMQ Server
        })
    }
});

//////////////////////
// /v1/game/:gameID //
//////////////////////

// Refers to a specific game identified by {gameID}.

// Get request to '/v1/game/:gameID'
// Gets current game information.
// 200: Successfully retrieves current game information
// 401: Attempts to access game which player is not part of
// 500: Internal server error
app.get("/:gameID", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        // !!! UNSURE OF HOW TO GET CURRENT GAME ID vvv !!!!
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
    }
});

// Patch request to '/v1/game/gameID'
// Update current game name, description, players, etc. 
// Conditions: Only the creator of the game should be able to change game information.
// 201: application/json. Successfully updates a game
// 401: player attempts to update game information not relating to them. 
//      Such as drawer, drawing_board, messages, or other people’s game_player
// 500: Internal server error
// Might need to add a condition where once a game is started, the game is closed and no one can
app.patch("/:gameID", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        // let user = JSON.parse(req.get('X-User'));
        if (checkIfCreator(req, result)) {
            let lobbyDesc = req.body.description ? req.body.description : "";
            let lobbyName = req.body.lobbyName ? req.body.lobbyName : "";
            // Patch the game
            connection.query(sqlPATCHGameByID, [lobbyName, lobbyDesc, req.params.gameID], (err, result) => {
                if (err) {
                    res.status(500).send("Internal Server Error");
                } else {
                    res.set("Content-Type", "application/json");
                    res.json(result);
                    // Send event to RabbitMQ Server
                }
            })
        }
    }
});

// Delete request to '/v1/game/gameID'
// Removes a game lobby.
// Conditions: Either all players leave the lobby or the creator deletes the lobby or the game is finished.
// 201: application/json. Successfully deletes game.
// 401: player attemtps to delete game that they did not create. 
// 500: Internal server error
app.delete("/:gameID", (req, res, next) => {
    if (!checkXUserHeader(req)) {
            res.status(401).send("Unauthorized");
    } else {
        connection.query(sqlGETGameByID, [req.params.gameID], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                // need to check if there are no members in the channel still
                if (checkIfCreator(req, result)) {
                    // Delete from users_games
                    connection.query(sqlDELETEGameFROMUsersGames, [req.params.gameID], (err, result) => {
                        if (err) {
                            res.status(500).send("Internal Server Error.");
                        } else {
                            // Delete from messages table
                            connection.query(sqlDELETEMessagesByGameID, [req.params.gameID], (err, result) => {
                                if (err) {
                                    res.status(500).send("Internal Server Error.");
                                } else {
                                    // Delete game from games table
                                    // May still need to delete from message table and corresponding
                                    // many-to-many table.
                                    connection.query(sqlDELETEGameByGameID, [req.params.gameID], (err, result) => {
                                        if (err) {
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
            }
        })
    } 
});

///////////////////////////////
// /v1/game/{gameID}/players //
///////////////////////////////

// Refers to current players in the game lobby.

// Post request to '/v1/game/:gameID/players
// Adds a new player to the game lobby.
// 201: application/json. Successfully adds user to game instance.
// 500: Internal server error
app.post(":gameID/players", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        connection.query(sqlGetGameByID, [req.params.gameID], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                let userID = req.body.id
                connection.query(sqlPOSTUserGames, [req.params.gameID, userID], (err, resullt) => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                    } else {
                        res.status(201);
                        res.send("User was added as a member of the game instance.");

                        //RabbitMQ event
                    }
                })
            }
        })
    }
})

// DELETE request to '/v1/game/:gameID/players
// Removes a player from the game instance.
// Conditions: User leaves the instance or closes browser???
// 201: application/json. Successfully adds user to game instance.
// 500: Internal server error
app.delete(":gameID/players", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        connnection.query(sqlGetGamesByID, [req.params.gameID], (err, result) => {
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
    }
})

// Perhaps consider putting all the API requests below this comment
// in another .js file to separate game lobbies
// from game instances.

///////////////////////////////
// /v1/game/:gameID/instance // <-- should this be :instanceID?
///////////////////////////////


// Refers to information in the current game. 
// This is information pertains to scores,
// drawing board information, current words,
// ect.

// Post request to '/v1/game/:gameID/:instanceID
// Creates a new game instance. *the actual game*
// 201: application/json. Sucecessfully creates a game instance.
// 500: Internal server error.
app.post(":gameID/instance", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        // create a board, get the board ID in return
        let newBoard = ""; // empty string = blank board
        connection.query(sqlPOSTBoard, [newBoard], (err, result) => {
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
    }
})

// Patch request to '/v1/game/:gameID/:instanceID
// Updates information such as scores, drawing board, current words,
// ect.
// Mainly going to be used to update drawing board information.
// 201: application/json. Successfully makes changes to the game instance.
// 500: Internal server error.
app.patch(":gameID/instanceID", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        // query current game instance and get all data
        connection.query(sqlGETGameInstanceBYID, [req.params.instanceID], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                // check each variable, if missing insert current data
                let currDrawer = req.body.currentDrawer ? req.body.currentDrawer : result.currentDrawer;
                let currRound = req.body.currentRound ? req.body.currentRound : result.currentRound;
                let currWord = req.body.currentWord ? req.body.currentWord : result.currentWord;
                let winner = req.body.winner? req.body.winner : result.winner;
                let score = req.body.score ? req.body.score : result.score;

                // query to make changes in Games_Instance Table
                connection.query(sqlPATCHGameInstance, [currDrawer, currRound, currWord, winner, score, req.params.instanceID], (err, result) => {
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
    }
})

/////////////////////////////////////
// /v1/game/:gameID/instance/board //
/////////////////////////////////////

// PATCH
// Updates Board, can update with empty string (blank board) to drawer changes
// I imagine this will be used when the board is reset
// every turn or once the current drawer changes. 
app.patch(":gameID/instance/board", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        // 
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

    }
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
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        // get userID, get gameID


        connection.query(sqlPOSTMessage, [userID, req.params.gameID, req.body.messageBody], (err, result) => {
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
app.patch(":gameID/:instanceID/message", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        connection.query(sqlPATCHMessage, [req.body.messageBody, req.params.messageID], (err, result) => {
            if(err) {
                res.status(500).send("Internal Server Error");
            } else {
                res.status(200);
                res.set("Content-Type", "application/json");
                res.json(result.messageBody);
            }
        }
    }
})




////////////////////
// HELPER METHODS //
////////////////////

// Function to see if X-User header is present in request
function checkXUserHeader(req) {
    let xUserHeader = req.get('X-User');
    if(xUserHeader == undefined || xUserHeader == "") {
      return false;
    } else {
      return true;
    }
}

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

// patch request to game instance, get new word