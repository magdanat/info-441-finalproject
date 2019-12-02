"use strict";
// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

// Create a new express application
const app = express.Router();

// SQL Queries
const sqlGETAllGames = "SELECT * FROM games";
const sqlGETGameByID = "SELECT * FROM Games WHERE GameID = ?";


let connection = mysql.createPool({
    // We are going to need to set this ENV variable, TODO
    host: process.env.MYSQL_ADDR,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DB
  });

//////////////
// /v1/game //
//////////////

// Refers to all current games.

// Get request to '/v1/game'
// Gets all current active game information
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
// Creates a new game.
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
app.get("/", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        // !!! UNSURE OF HOW TO GET CURRENT GAME ID vvv !!!!
        connection.query(sqlGETGameByID, [req.params.GameID], (err, result) => {
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
app.patch("/", (req, res, next) => {
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {
        let user = JSON.parse(req.get('X-User'));

    }
});

// Delete request to '/v1/game/gameID'
// Removes a game instance.
// Conditions: Either all players leave the channel or the creator deletes the channel.
// 201: application/json. Successfully deletes game.
// 401: player attemtps to delete game that they did not create. 
// 500: Internal server error
app.delete("/", (req, res, next) => {
    if (!checkXUserHeader(req)) {
            res.status(401).send("Unauthorized");
    } else {
        connection.query(sqlGETGameByID, [req.params.gameID], (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {

            }
        })
    } 
});

///////////////////////////////
// /v1/game/{gameID}/players //
///////////////////////////////

// Refers to current players in the game lobby.

// Post request to '/v1/game/:gameID/players




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