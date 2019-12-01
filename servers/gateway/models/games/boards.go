package games

import {

}

type Drawingboard Struct {
	ID		int64	`json:"drawingBoardID"`
	// Array of Coords	[]
}

type Coords Struct {
	XCoord	int64 `json:"xCoord"`
	YCoord	int64 `json:"yCoord"`
}