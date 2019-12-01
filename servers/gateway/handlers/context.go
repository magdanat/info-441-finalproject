package handlers

import (
	"info-441-finalproject/servers/gateway/models/users"
	"info-441-finalproject/servers/gateway/sessions"
)

//TODO: define a handler context struct that
//will be a receiver on any of your HTTP
//handler functions that need access to
//globals, such as the key used for signing
//and verifying SessionIDs, the session store
//and the user store

//HandlerContext gives handler functions access to gloabls
type HandlerContext struct {
	SigningKey   string               `json:"signingKey,omitempty"`
	SessionStore *sessions.RedisStore `json:"sessionStore,omitempty"`
	UserStore    *users.MySQLStore    `json:"userStore,omitempty"`
	Notifier     *Notifier
}
