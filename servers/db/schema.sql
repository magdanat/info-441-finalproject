-- Player Models
CREATE TABLE IF NOT EXISTS Users (
    UserID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(128) NOT NULL UNIQUE,
    PassHash BINARY(32) NOT NULL,
    UserName VARCHAR(255) UNIQUE,
    FirstName VARCHAR(128) NOT NULL,
    LastName VARCHAR (128) NOT NULL
);

-- Game Models
CREATE TABLE IF NOT EXISTS Games (
    GameID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    CreatedAt DATETIME NOT NULL,
    LobbyName VARCHAR(128) NOT NULL,
    LobbyDesc VARCHAR(128),    
    NumberOfRounds INT DEFAULT 3,
    CurrentRound INT DEFAULT 0,
    Winner  VARCHAR(128)
    BoardID INT NOT NULL,
    FOREIGN KEY (BoardID) references Board(BoardID)  ,
    WordID INT,
    FOREIGN KEY (WordID) references Word(WordID),
    CurrentDrawer INT,
    FOREIGN KEY (CurrentDrawer) references User(UserID),
    DrawingTimer INT NOT NULL,
    TimeElapsed INT
);

-- Drawingboard Models
CREATE TABLE IF NOT EXISTS Board (
    BoardID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
);

-- Coordinate Model
CREATE TABLE IF NOT EXISTS Coordinates (
    CoordinateID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    BoardID INT NOT NULL,
    FOREIGN KEY (BoardID) references Board(BoardID),
    XCoord  INT NOT NULL,
    YCoord INT NOT NULL,
)

-- Words Model
CREATE TABLE IF NOT EXISTS Words (
    WordID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Word VARCHAR(128) NOT NULL
);

-- Messages model
CREATE TABLE IF NOT EXISTS Messages (
    MessageID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    FOREIGN KEY (UserID) references User(UserID),
    GameID INT,
    FOREIGN KEY (GameID) references Games(GameID)
    MessageBody VARCHAR(128)
);

-- Users_Game represents the users in a game instance
CREATE TABLE IF NOT EXISTS Users_Game (
    UserGameID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    FOREIGN KEY (GameID) references Games(GameID),
    UserID INT NOT NULL,
    FOREIGN KEY (UserID) references Users(UserID)
);