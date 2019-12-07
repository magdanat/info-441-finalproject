package handlers

import "info441testrepo/server/gateway/models/users"

// import (
// 	"info441testrepo/server/gateway/models/users"
// )

//TODO: define a handler context struct that
//will be a receiver on any of your HTTP
//handler functions that need access to
//globals, such as the key used for signing
//and verifying SessionIDs, the session store
//and the user store

//HandlerContext gives handler functions access to gloabls
type HandlerContext struct {
	UserStore   *users.MySQLStore `json:"userStore,omitempty"`
	SocketStore *SocketStore
}
