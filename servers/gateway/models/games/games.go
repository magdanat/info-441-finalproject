package games

import (
	"errors"
	"time"
)

// Game represents a user account in the database
type Game struct {
	ID            int64     `json:"gameID"`
	CreatedAt     time.Time `json:"createdAt"`
	LobbyName     string    `json:"lobbyName"`
	LobbyDesc     string    `json:"lobbyDesc"`
	MaxPlayers    int64     `json:"maxPlayers"` // Max of _ players?
	Players       []int64   `json:"userIDs"`
	NumOfRounds   int64     `json:"numOfRounds"` // Max of _ rounds?
	CurrRound     int64     `json:"currRound"`
	Winner        int64     `json:"winner"`
	Word          int64     `json:"word"`
	CurrentDrawer int64     `json:"playerID"`
	DrawingTimer  time.Time `json:"drawingTimer"`
	Messages      []int64   `json:"messages"`
	TimeElapsed   time.Time `json:"timeElapsed"`
	// DrawingBoard
}

// GameUpdates represents allowed updates to a game
type GameUpdates struct {
	LobbyName   string `json:"lobbyName"`
	LobbyDesc   string `json:"lobbyDesc"`
	MaxPlayers  int64  `json:"maxPlayers"`
	NumOfRounds int64  `json:"numOfRounds"`
}

// GamePlayer represents a single game tied to a single player.
// Needed to record player data tied to a game.
type GamePlayer struct {
	ID     int64 `json:"id"`
	Game   int64 `json:"gameID"`
	Player int64 `json:"playerID"`
	Score  int64 `json:"scoreValue"`
}

// CreateGame creates an initial game instance.
func (g *Game) CreateGame() (*Game, error) {
	game := new(Game)
	game.LobbyName = g.LobbyName
	return game, nil
}

// UpdateGame updates current game details.
func (g *Game) UpdateGame(updates *GameUpdates) error {
	lobbyName := updates.LobbyName
	lobbyDesc := updates.LobbyDesc
	maxPlayers := updates.MaxPlayers
	numOfRounds := updates.NumOfRounds
	if len(lobbyName) == 0 {
		return errors.New("Lobby name cannot be of length zero")
	}
	if len(lobbyDesc) > 100 {
		return errors.New("Lobby description cannot be more than 100 characters")
	}
	// Use this to set max players
	if maxPlayers > 6 {
		return errors.New("Max players cannot be more than 6")
	}
	if maxPlayers < 2 {
		return errors.New("Max players cannot be less than 2")
	}
	if numOfRounds > 4 {
		return errors.New("Number of rounds cannot be more than 4")
	}
	if numOfRounds < 1 {
		return errors.New("Number of rounds cannot be less than 1")
	}
	return nil
}
