"use strict";
// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

// Create a new express application
const app = express.Router();

// Get request to '/v1/game'
// Gets current game information
// 200: Successfully retrieves current game information
// 401: Attempts to access game which player is not part of
// 500: Internal server error
app.get("/", (req, res, next) => {
    
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
        let description = req.body.description ? req.body.description : "";
        // sql request to insert 
    }
});

// Patch request to '/v1/game'
// Update current game information including score and messages.
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

// Delete request to '/v1/game'
// Removes a game instance.
// 201: application/json. Successfully deletes game.
// 401: player attemtps to delete game that they did not create. 
// 500: Internal server error
app.delete("/", (req, res, next) => {

});


// Helper Methods

// Function to see if X-User header is present in request
function checkXUserHeader(req) {
    let xUserHeader = req.get('X-User');
    if(xUserHeader == undefined || xUserHeader == "") {
      return false;
    } else {
      return true;
    }
  }
  
  // Need to export the router
  module.exports = app;