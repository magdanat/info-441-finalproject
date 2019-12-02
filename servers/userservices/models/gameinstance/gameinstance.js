"use strict";
// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

// Create a new express application
const app = express.Router();

// Strings for queries
const sqlGETAllChannels = "SELECT * FROM games";
const sqlGETGameByID = "SELECT * FROM games WHERE GameID = ?";

// Get request to '/v1/game/gameID'
// Gets all current active games
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
                res.status(201);
                res.set("Content-Type", "application/json");
                res.json(result);
            }
        })
    }
});

// Get request to '/v1/game/gameID'
// Gets all current active games
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
                res.status(201);
                res.set("Content-Type", "application/json");
                res.json(result);
            }
        })
    }
});

// Patch request to '/v1/game/'
// Update current game information including score and messages.
// 201: application/json. Successfully updates a game
// 401: player attempts to update game information not relating to them. 
//      Such as drawer, drawing_board, messages, or other people’s game_player
// 500: Internal server error
app.patch("/", (req, res, next) => {
    // Need to check other things listed in 401:
    if (!checkXUserHeader(req)) {
        res.status(401).send("Unauthorized");
    } else {

        
});

// Delete request to '/v1/game/instance'
// Removes a game instance.
// 201: application/json. Successfully deletes game.
// 401: player attemtps to delete game that they did not create. 
// 500: Internal server error
app.delete("/", (req, res, next) => {

});