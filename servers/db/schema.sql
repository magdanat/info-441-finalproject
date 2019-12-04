-- Player Models
CREATE TABLE IF NOT EXISTS Users (
    UserID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(255)
);

-- Game Models
CREATE TABLE IF NOT EXISTS Games (
    GameID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    LobbyName VARCHAR(128) NOT NULL,
    LobbyDesc VARCHAR(128),   
    MaxPlayers INT DEFAULT 4, 
    -- Array of Players (Users_Games Table) Represents users currently in the game lobby. 
    NumberOfRounds INT DEFAULT 3,
    -- Array of Words
    GameCreator INT,
    FOREIGN KEY (GameCreator) references Users(UserID)
    -- DrawingTimer INT NOT NULL

    
    -- TimeElapsed INT
    -- CurrentDrawer INT,
    -- FOREIGN KEY (CurrentDrawer) references Users(UserID),
    -- CurrentRound INT DEFAULT 0,
    -- Winner  VARCHAR(128)
    -- BoardID INT,
    -- FOREIGN KEY (BoardID) references Board(BoardID),
);

-- Drawingboard Models
-- Contains drawings made by users.
CREATE TABLE IF NOT EXISTS Board (
    BoardID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    -- list of coordinates (Coordiantes table) may no longer be necessary
    -- if we are storing drawings as strings.
    Drawing TEXT -- Stores drawings as strings
);

-- Game Instance Model
-- Not too sure if this is necessary but creating it 
-- just in case.
-- How to reference an attribute from another table?
CREATE TABLE IF NOT EXISTS Games_Instance (
    GameInstanceID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    GameID INT,
    FOREIGN KEY (GameID) references Games(GameID),
    NumberOfRounds INT DEFAULT 3,
    BoardID INT,
    FOREIGN KEY (BoardID) references Board(BoardID),
    CurrentDrawer INT,
    FOREIGN KEY (CurrentDrawer) references Users(UserID),
    CurrentRound INT DEFAULT 0,
    CurrentWord VARCHAR(128), 
    Winner VARCHAR(128), 
    Score INT DEFAULT 500 -- Handle scoring in front end
);


-- -- Coordinate Model
-- -- Represents all the coordinates in a given board. 
-- CREATE TABLE IF NOT EXISTS Coordinates (
--     CoordinateID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
--     BoardID INT NOT NULL,
--     FOREIGN KEY (BoardID) references Board(BoardID),
--     XCoord  INT NOT NULL,
--     YCoord INT NOT NULL,
-- )

-- Words Model
-- Represents all the words that can be chosen 
-- Might not need if we are grabbing information off of a .csv file.
-- Can just compare the message on the frontEnd of things. 
CREATE TABLE IF NOT EXISTS Words (
    WordID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Word VARCHAR(128) NOT NULL
);

-- Messages model
-- Compare "message" that user sends to the currentword of the game instance.
CREATE TABLE IF NOT EXISTS Messages (
    MessageID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    FOREIGN KEY (UserID) references Users(UserID),
    GameID INT,
    FOREIGN KEY (GameID) references Games(GameID),
    MessageBody VARCHAR(128)
);

-- Users_Game represents the users in a game instance. 
-- Many to many relationship between Users Table and Games Table.
-- Any time a user is added into a lobby, add them into this table.
-- Can use this table to also find out who is in a game instance
-- by selecting all the users who have the same GameID that
-- the game instance contains. 
CREATE TABLE IF NOT EXISTS Users_Game (
    UserGameID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    FOREIGN KEY (GameID) references Games(GameID),
    UserID INT NOT NULL,
    FOREIGN KEY (UserID) references Users(UserID),
    SCORE INT DEFAULT 0
);
